-- Requested-guide fulfillment outbox. Run after supabase-schema.sql exists.
-- Idempotent and non-destructive. Does NOT import historical subscribers.
-- Apply BEFORE enabling SYSTEME_IO_ENABLED / SYSTEME_IO_GUIDE_DELIVERY_READY.
BEGIN;

CREATE TABLE IF NOT EXISTS public.systeme_guide_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  guide_version text NOT NULL DEFAULT 'gentle-gut-guide-v1',
  tag_id bigint NOT NULL CHECK (tag_id > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','synced','suppressed','failed','uncertain')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  run_after timestamptz NOT NULL DEFAULT now(),
  lease_token uuid,
  locked_until timestamptz,
  reconcile_only boolean NOT NULL DEFAULT false,
  provider_contact_id bigint,
  last_error_code varchar(60),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subscriber_id, guide_version)
);
CREATE INDEX IF NOT EXISTS systeme_guide_jobs_due ON public.systeme_guide_jobs(status, run_after);
ALTER TABLE public.systeme_guide_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systeme_guide_jobs FORCE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.systeme_guide_jobs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.systeme_guide_jobs TO service_role;
DROP POLICY IF EXISTS systeme_jobs_deny_clients ON public.systeme_guide_jobs;
CREATE POLICY systeme_jobs_deny_clients ON public.systeme_guide_jobs
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.capture_systeme_guide_request(
  p_name text, p_email text, p_source text, p_marketing_consent boolean, p_tag_id bigint
) RETURNS TABLE(job_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $capture$
DECLARE v_subscriber uuid; v_job uuid; v_email text := lower(btrim(p_email));
BEGIN
  IF v_email IS NULL OR length(v_email) > 254 OR p_tag_id IS NULL OR p_tag_id <= 0 THEN
    RAISE EXCEPTION 'Invalid guide request';
  END IF;
  INSERT INTO public.subscribers(name,email,source,marketing_consent,consent_date)
  VALUES (left(coalesce(nullif(btrim(p_name),''),'Reader'),80),v_email,left(coalesce(p_source,'ebook_lead_modal'),60),
    coalesce(p_marketing_consent,false),CASE WHEN p_marketing_consent THEN now() ELSE NULL END)
  ON CONFLICT(email) DO NOTHING RETURNING id INTO v_subscriber;
  IF v_subscriber IS NULL THEN
    SELECT s.id INTO STRICT v_subscriber FROM public.subscribers s WHERE s.email = v_email;
  END IF;
  -- Original name/consent and suppression are never overwritten by a public retry.
  -- A new explicit email-guide request may enqueue once for an existing address.
  INSERT INTO public.systeme_guide_jobs(subscriber_id,tag_id)
  VALUES (v_subscriber,p_tag_id)
  ON CONFLICT(subscriber_id,guide_version) DO NOTHING RETURNING id INTO v_job;
  IF v_job IS NULL THEN
    SELECT j.id INTO STRICT v_job FROM public.systeme_guide_jobs j
    WHERE j.subscriber_id = v_subscriber AND j.guide_version = 'gentle-gut-guide-v1';
  END IF;
  RETURN QUERY SELECT v_job;
END;
$capture$;

CREATE OR REPLACE FUNCTION public.claim_systeme_guide_job(p_job_id uuid DEFAULT NULL)
RETURNS TABLE(job_id uuid,email text,tag_id bigint,lease_token uuid,attempts integer,reconcile_only boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $claim$
BEGIN
  -- No blind replays after the retry budget is exhausted.
  UPDATE public.systeme_guide_jobs j SET status = 'uncertain', last_error_code = 'lease_retry_limit',
    lease_token = NULL, locked_until = NULL, updated_at = now()
    WHERE j.status = 'processing' AND j.locked_until <= now() AND j.attempts >= 5;
  RETURN QUERY
  WITH selected AS (
    SELECT j.id FROM public.systeme_guide_jobs j
    WHERE (p_job_id IS NULL OR j.id = p_job_id) AND j.attempts < 5
      AND ((j.status = 'pending' AND j.run_after <= now()) OR (j.status = 'processing' AND j.locked_until <= now()))
    ORDER BY j.run_after,j.created_at
    FOR UPDATE SKIP LOCKED LIMIT 1
  ), leased AS (
    UPDATE public.systeme_guide_jobs j SET status = 'processing', attempts = j.attempts + 1,
      reconcile_only = j.reconcile_only OR j.status = 'processing',
      lease_token = gen_random_uuid(), locked_until = now() + interval '2 minutes', updated_at = now()
    FROM selected WHERE j.id = selected.id
    RETURNING j.id,j.subscriber_id,j.tag_id,j.lease_token,j.attempts,j.reconcile_only
  ) SELECT l.id,s.email,l.tag_id,l.lease_token,l.attempts,l.reconcile_only
    FROM leased l JOIN public.subscribers s ON s.id = l.subscriber_id;
END;
$claim$;

CREATE OR REPLACE FUNCTION public.finish_systeme_guide_job(
  p_job_id uuid,p_lease_token uuid,p_status text,p_error_code text,p_contact_id bigint,
  p_retry_seconds integer,p_reconcile_only boolean
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $finish$
BEGIN
  IF p_status NOT IN ('pending','synced','suppressed','failed','uncertain') THEN
    RAISE EXCEPTION 'Invalid guide job status';
  END IF;
  UPDATE public.systeme_guide_jobs j SET
    status = CASE WHEN p_status = 'pending' AND j.attempts >= 5 THEN 'failed' ELSE p_status END,
    last_error_code = CASE WHEN p_error_code ~ '^[a-z0-9_]{1,60}$' THEN p_error_code ELSE NULL END,
    provider_contact_id = coalesce(p_contact_id,j.provider_contact_id),
    reconcile_only = j.reconcile_only OR coalesce(p_reconcile_only,false),
    run_after = now() + make_interval(secs => greatest(60,least(coalesce(p_retry_seconds,60),86400))),
    lease_token = NULL,locked_until = NULL,updated_at = now()
  WHERE j.id = p_job_id AND j.lease_token = p_lease_token AND j.status = 'processing';
END;
$finish$;

REVOKE ALL ON FUNCTION public.capture_systeme_guide_request(text,text,text,boolean,bigint) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.claim_systeme_guide_job(uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.finish_systeme_guide_job(uuid,uuid,text,text,bigint,integer,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.capture_systeme_guide_request(text,text,text,boolean,bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_systeme_guide_job(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_systeme_guide_job(uuid,uuid,text,text,bigint,integer,boolean) TO service_role;
COMMIT;
