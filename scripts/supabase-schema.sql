-- Everyday Gut Wellness — persistent subscriber storage and admin audit tables.
-- Run once in Supabase SQL Editor. Uses normalized lowercase email addresses.

CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(80) NOT NULL DEFAULT 'Reader',
  email text NOT NULL,
  signup_date timestamptz NOT NULL DEFAULT now(),
  source varchar(60) NOT NULL DEFAULT 'ebook_lead_modal',
  marketing_consent boolean NOT NULL DEFAULT false,
  consent_date timestamptz,
  consent_withdrawn_at timestamptz,
  sender_synced boolean NOT NULL DEFAULT false,
  sender_synced_at timestamptz,
  sender_sync_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Keep existing installations in sync when the table predates these fields.
-- CREATE TABLE IF NOT EXISTS does not add columns to an existing table.
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS sender_sync_error text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.subscribers SET email = lower(trim(email)) WHERE email <> lower(trim(email));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subscribers_email_key'
      AND conrelid = 'public.subscribers'::regclass
  ) THEN
    ALTER TABLE public.subscribers
      ADD CONSTRAINT subscribers_email_key UNIQUE (email);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscribers_consent
  ON public.subscribers (marketing_consent) WHERE marketing_consent = true;
CREATE INDEX IF NOT EXISTS idx_subscribers_signup_date
  ON public.subscribers (signup_date DESC);

CREATE OR REPLACE FUNCTION public.update_subscribers_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_subscribers_updated_at ON public.subscribers;
CREATE TRIGGER trg_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION public.update_subscribers_updated_at();

CREATE TABLE IF NOT EXISTS public.admin_auth_attempts (
  id bigserial PRIMARY KEY,
  ip_hash varchar(64) NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_lookup
  ON public.admin_auth_attempts (ip_hash, attempted_at DESC);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_auth_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny public anon access to subscribers" ON public.subscribers;
CREATE POLICY "Deny public anon access to subscribers"
  ON public.subscribers FOR ALL TO anon USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Allow service_role full access to subscribers" ON public.subscribers;
CREATE POLICY "Allow service_role full access to subscribers"
  ON public.subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Deny public anon access to auth attempts" ON public.admin_auth_attempts;
CREATE POLICY "Deny public anon access to auth attempts"
  ON public.admin_auth_attempts FOR ALL TO anon USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Allow service_role full access to auth attempts" ON public.admin_auth_attempts;
CREATE POLICY "Allow service_role full access to auth attempts"
  ON public.admin_auth_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);
