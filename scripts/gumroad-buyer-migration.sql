-- Additive buyer-exclusion ledger/outbox. No emails or marketing are sent by SQL.
-- Apply and validate BEFORE enabling GUMROAD_BUYER_SYNC_ENABLED / READY.
BEGIN;

CREATE TABLE IF NOT EXISTS public.gumroad_buyer_scans (
  product_id text PRIMARY KEY,
  page_key text,
  pages_in_cycle integer NOT NULL DEFAULT 0 CHECK (pages_in_cycle >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  run_after timestamptz NOT NULL DEFAULT now(),
  lease_token uuid,
  locked_until timestamptz,
  last_error_code varchar(60),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (product_id IN ('UGBupbL5E-xqZvSgohnMZA==','2vnXsWgp27izpPCDeyuKfg==')),
  CHECK (page_key IS NULL OR length(page_key) BETWEEN 1 AND 1024)
);
-- Earlier local candidates capped historical pages. Keep the counter diagnostic;
-- fixed per-invocation work, not lifetime sales, bounds resource use.
ALTER TABLE public.gumroad_buyer_scans DROP CONSTRAINT IF EXISTS gumroad_buyer_scans_pages_in_cycle_check;
ALTER TABLE public.gumroad_buyer_scans ADD CONSTRAINT gumroad_buyer_scans_pages_in_cycle_check CHECK (pages_in_cycle >= 0);
INSERT INTO public.gumroad_buyer_scans(product_id)
VALUES ('UGBupbL5E-xqZvSgohnMZA=='),('2vnXsWgp27izpPCDeyuKfg==')
ON CONFLICT(product_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.gumroad_buyer_sales (
  sale_id text PRIMARY KEY CHECK (length(sale_id) BETWEEN 1 AND 128),
  product_id text NOT NULL REFERENCES public.gumroad_buyer_scans(product_id),
  seller_id text NOT NULL CHECK (length(seller_id) BETWEEN 1 AND 128),
  first_observed_at timestamptz NOT NULL DEFAULT now(),
  last_observed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.gumroad_buyer_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id text NOT NULL REFERENCES public.gumroad_buyer_sales(sale_id),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254 AND email = lower(btrim(email))),
  tag_id bigint NOT NULL CHECK (tag_id > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','synced','failed','uncertain')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  run_after timestamptz NOT NULL DEFAULT now(),
  lease_token uuid,
  locked_until timestamptz,
  reconcile_only boolean NOT NULL DEFAULT false,
  provider_contact_id bigint,
  last_error_code varchar(60),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sale_id,email)
);
CREATE INDEX IF NOT EXISTS gumroad_buyer_jobs_due ON public.gumroad_buyer_jobs(status,run_after);
CREATE INDEX IF NOT EXISTS gumroad_buyer_sales_product_id ON public.gumroad_buyer_sales(product_id);
CREATE INDEX IF NOT EXISTS gumroad_buyer_jobs_sale_id ON public.gumroad_buyer_jobs(sale_id);
-- One permanent classification per address across both products and all sales.
-- Separate invoices must not create concurrent tag mutations for the same buyer.
CREATE UNIQUE INDEX IF NOT EXISTS gumroad_buyer_jobs_email ON public.gumroad_buyer_jobs(email);

ALTER TABLE public.gumroad_buyer_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gumroad_buyer_scans FORCE ROW LEVEL SECURITY;
ALTER TABLE public.gumroad_buyer_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gumroad_buyer_sales FORCE ROW LEVEL SECURITY;
ALTER TABLE public.gumroad_buyer_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gumroad_buyer_jobs FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.gumroad_buyer_scans, public.gumroad_buyer_sales, public.gumroad_buyer_jobs FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.gumroad_buyer_scans, public.gumroad_buyer_sales, public.gumroad_buyer_jobs TO service_role;
DROP POLICY IF EXISTS gumroad_scans_deny_clients ON public.gumroad_buyer_scans;
CREATE POLICY gumroad_scans_deny_clients ON public.gumroad_buyer_scans AS RESTRICTIVE FOR ALL TO anon,authenticated USING(false) WITH CHECK(false);
DROP POLICY IF EXISTS gumroad_sales_deny_clients ON public.gumroad_buyer_sales;
CREATE POLICY gumroad_sales_deny_clients ON public.gumroad_buyer_sales AS RESTRICTIVE FOR ALL TO anon,authenticated USING(false) WITH CHECK(false);
DROP POLICY IF EXISTS gumroad_jobs_deny_clients ON public.gumroad_buyer_jobs;
CREATE POLICY gumroad_jobs_deny_clients ON public.gumroad_buyer_jobs AS RESTRICTIVE FOR ALL TO anon,authenticated USING(false) WITH CHECK(false);

CREATE OR REPLACE FUNCTION public.claim_gumroad_buyer_scan()
RETURNS TABLE(product_id text,page_key text,lease_token uuid,attempts integer,pages_in_cycle integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $claim_scan$
BEGIN
  UPDATE public.gumroad_buyer_scans s SET status='failed',last_error_code='scan_retry_limit',
    lease_token=NULL,locked_until=NULL,updated_at=now()
    WHERE s.status='processing' AND s.locked_until<=now() AND s.attempts>=5;
  RETURN QUERY
  WITH selected AS (
    SELECT s.product_id FROM public.gumroad_buyer_scans s
    WHERE s.attempts<5 AND ((s.status='pending' AND s.run_after<=now()) OR (s.status='processing' AND s.locked_until<=now()))
    ORDER BY s.run_after,s.product_id FOR UPDATE SKIP LOCKED LIMIT 1
  ), leased AS (
    UPDATE public.gumroad_buyer_scans s SET status='processing',attempts=s.attempts+1,
      lease_token=gen_random_uuid(),locked_until=now()+interval '2 minutes',updated_at=now()
    FROM selected WHERE s.product_id=selected.product_id
    RETURNING s.product_id,s.page_key,s.lease_token,s.attempts,s.pages_in_cycle
  ) SELECT l.product_id,l.page_key,l.lease_token,l.attempts,l.pages_in_cycle FROM leased l;
END;
$claim_scan$;

CREATE OR REPLACE FUNCTION public.stage_gumroad_buyer_page(
  p_product_id text,p_lease_token uuid,p_seller_id text,p_tag_id bigint,p_next_cursor text,p_sales jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $stage$
DECLARE v_scan public.gumroad_buyer_scans%ROWTYPE; v_sale jsonb; v_email text; v_sale_id text;
BEGIN
  SELECT s.* INTO v_scan FROM public.gumroad_buyer_scans s
    WHERE s.product_id=p_product_id AND s.lease_token=p_lease_token AND s.status='processing' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Scan lease is not current'; END IF;
  IF p_seller_id IS NULL OR length(p_seller_id) NOT BETWEEN 1 AND 128 OR p_tag_id IS NULL OR p_tag_id<=0
    OR p_sales IS NULL OR jsonb_typeof(p_sales)<>'array' OR jsonb_array_length(p_sales)>20
    OR (p_next_cursor IS NOT NULL AND (length(p_next_cursor) NOT BETWEEN 1 AND 1024 OR p_next_cursor=v_scan.page_key)) THEN
    RAISE EXCEPTION 'Invalid buyer page';
  END IF;
  FOR v_sale IN SELECT value FROM jsonb_array_elements(p_sales) LOOP
    v_sale_id := v_sale->>'sale_id';
    IF jsonb_typeof(v_sale)<>'object' OR v_sale_id IS NULL OR length(v_sale_id) NOT BETWEEN 1 AND 128
      OR jsonb_typeof(v_sale->'emails') IS DISTINCT FROM 'array' OR jsonb_array_length(v_sale->'emails') NOT BETWEEN 1 AND 3 THEN
      RAISE EXCEPTION 'Invalid buyer sale';
    END IF;
    IF EXISTS(SELECT 1 FROM public.gumroad_buyer_sales s WHERE s.sale_id=v_sale_id AND (s.product_id<>p_product_id OR s.seller_id<>p_seller_id)) THEN
      RAISE EXCEPTION 'Buyer sale identity changed';
    END IF;
    INSERT INTO public.gumroad_buyer_sales(sale_id,product_id,seller_id) VALUES(v_sale_id,p_product_id,p_seller_id)
      ON CONFLICT(sale_id) DO UPDATE SET last_observed_at=now();
    FOR v_email IN SELECT DISTINCT lower(btrim(value)) FROM jsonb_array_elements_text(v_sale->'emails') LOOP
      IF v_email IS NULL OR length(v_email)>254 OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
        RAISE EXCEPTION 'Invalid buyer address';
      END IF;
      IF EXISTS(SELECT 1 FROM public.gumroad_buyer_jobs j WHERE j.email=v_email AND j.tag_id<>p_tag_id) THEN
        RAISE EXCEPTION 'Buyer tag configuration changed';
      END IF;
      INSERT INTO public.gumroad_buyer_jobs(sale_id,email,tag_id) VALUES(v_sale_id,v_email,p_tag_id)
        ON CONFLICT(email) DO NOTHING;
      -- A concurrent page can win the unique-email insert after the earlier read.
      -- Do not advance this cursor if it pinned a different tag configuration.
      IF EXISTS(SELECT 1 FROM public.gumroad_buyer_jobs j WHERE j.email=v_email AND j.tag_id<>p_tag_id) THEN
        RAISE EXCEPTION 'Buyer tag configuration changed';
      END IF;
    END LOOP;
  END LOOP;
  -- Cursor and new jobs commit together. An interrupted HTTP response cannot lose a page.
  UPDATE public.gumroad_buyer_scans s SET page_key=p_next_cursor,
    pages_in_cycle=CASE WHEN p_next_cursor IS NULL THEN 0 ELSE s.pages_in_cycle+1 END,
    status='pending',attempts=0,run_after=now()+interval '5 minutes',lease_token=NULL,locked_until=NULL,
    last_error_code=NULL,updated_at=now() WHERE s.product_id=p_product_id AND s.lease_token=p_lease_token;
END;
$stage$;

CREATE OR REPLACE FUNCTION public.fail_gumroad_buyer_scan(
  p_product_id text,p_lease_token uuid,p_error_code text,p_retry_seconds integer,p_retryable boolean
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $fail_scan$
BEGIN
  UPDATE public.gumroad_buyer_scans s SET
    status=CASE WHEN coalesce(p_retryable,false) AND s.attempts<5 THEN 'pending' ELSE 'failed' END,
    last_error_code=CASE WHEN p_error_code ~ '^[a-z0-9_]{1,60}$' THEN p_error_code ELSE 'scan_failed' END,
    run_after=now()+make_interval(secs=>greatest(60,least(coalesce(p_retry_seconds,60),86400))),
    lease_token=NULL,locked_until=NULL,updated_at=now()
  WHERE s.product_id=p_product_id AND s.lease_token=p_lease_token AND s.status='processing';
END;
$fail_scan$;

CREATE OR REPLACE FUNCTION public.claim_gumroad_buyer_job()
RETURNS TABLE(job_id uuid,email text,tag_id bigint,lease_token uuid,attempts integer,reconcile_only boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $claim_job$
BEGIN
  UPDATE public.gumroad_buyer_jobs j SET status='uncertain',last_error_code='lease_retry_limit',
    lease_token=NULL,locked_until=NULL,updated_at=now()
    WHERE j.status='processing' AND j.locked_until<=now() AND j.attempts>=5;
  RETURN QUERY
  WITH selected AS (
    SELECT j.id FROM public.gumroad_buyer_jobs j WHERE j.attempts<5
      AND ((j.status='pending' AND j.run_after<=now()) OR (j.status='processing' AND j.locked_until<=now()))
    ORDER BY j.run_after,j.created_at,j.id FOR UPDATE SKIP LOCKED LIMIT 1
  ), leased AS (
    UPDATE public.gumroad_buyer_jobs j SET status='processing',attempts=j.attempts+1,
      reconcile_only=j.reconcile_only OR j.status='processing',lease_token=gen_random_uuid(),
      locked_until=now()+interval '2 minutes',updated_at=now()
    FROM selected WHERE j.id=selected.id RETURNING j.id,j.email,j.tag_id,j.lease_token,j.attempts,j.reconcile_only
  ) SELECT l.id,l.email,l.tag_id,l.lease_token,l.attempts,l.reconcile_only FROM leased l;
END;
$claim_job$;

CREATE OR REPLACE FUNCTION public.finish_gumroad_buyer_job(
  p_job_id uuid,p_lease_token uuid,p_status text,p_error_code text,p_contact_id bigint,p_retry_seconds integer,p_reconcile_only boolean
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $finish_job$
BEGIN
  IF p_status IS NULL OR p_status NOT IN ('pending','synced','failed','uncertain') THEN RAISE EXCEPTION 'Invalid buyer job status'; END IF;
  UPDATE public.gumroad_buyer_jobs j SET
    status=CASE WHEN p_status='pending' AND j.attempts>=5 THEN CASE WHEN j.reconcile_only OR coalesce(p_reconcile_only,false) THEN 'uncertain' ELSE 'failed' END ELSE p_status END,
    last_error_code=CASE WHEN p_error_code ~ '^[a-z0-9_]{1,60}$' THEN p_error_code ELSE NULL END,
    provider_contact_id=coalesce(p_contact_id,j.provider_contact_id),reconcile_only=j.reconcile_only OR coalesce(p_reconcile_only,false),
    run_after=now()+make_interval(secs=>greatest(60,least(coalesce(p_retry_seconds,60),86400))),
    lease_token=NULL,locked_until=NULL,updated_at=now()
  WHERE j.id=p_job_id AND j.lease_token=p_lease_token AND j.status='processing';
END;
$finish_job$;

REVOKE ALL ON FUNCTION public.claim_gumroad_buyer_scan() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.stage_gumroad_buyer_page(text,uuid,text,bigint,text,jsonb) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.fail_gumroad_buyer_scan(text,uuid,text,integer,boolean) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.claim_gumroad_buyer_job() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.finish_gumroad_buyer_job(uuid,uuid,text,text,bigint,integer,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_gumroad_buyer_scan() TO service_role;
GRANT EXECUTE ON FUNCTION public.stage_gumroad_buyer_page(text,uuid,text,bigint,text,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_gumroad_buyer_scan(text,uuid,text,integer,boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_gumroad_buyer_job() TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_gumroad_buyer_job(uuid,uuid,text,text,bigint,integer,boolean) TO service_role;
COMMIT;
