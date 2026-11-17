-- Separate, private bundle launch-alert permissions. No subscriber/provider writes.
-- MANUAL SETUP ONLY: review and apply this file to the intended Supabase project
-- before setting server-only BUNDLE_LAUNCH_ALERTS_ENABLED=true. Default is false.
-- No historical guide records are copied or enrolled. No email is sent here.
-- To withdraw an alert permission, a trusted database operator sets withdrawn_at.
-- Never delete a withdrawn row or clear withdrawn_at to process a public retry.
BEGIN;

CREATE TABLE IF NOT EXISTS public.bundle_launch_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(254) NOT NULL UNIQUE
    CHECK (email = lower(btrim(email)) AND char_length(email) BETWEEN 3 AND 254 AND position('@' in email) > 1),
  name varchar(80) NOT NULL
    CHECK (name = btrim(name) AND char_length(name) BETWEEN 1 AND 80 AND name !~ '[[:cntrl:]<>]'),
  consent_version text NOT NULL DEFAULT 'egw-bundle-alert-v1'
    CHECK (consent_version = 'egw-bundle-alert-v1'),
  requested_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz
);

ALTER TABLE public.bundle_launch_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_launch_interests FORCE ROW LEVEL SECURITY;
-- Remove inherited/default grants, including any broader service-role grant.
REVOKE ALL PRIVILEGES ON TABLE public.bundle_launch_interests FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON TABLE public.bundle_launch_interests TO service_role;

DROP POLICY IF EXISTS bundle_interest_deny_clients ON public.bundle_launch_interests;
CREATE POLICY bundle_interest_deny_clients ON public.bundle_launch_interests
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS bundle_interest_service_read ON public.bundle_launch_interests;
CREATE POLICY bundle_interest_service_read ON public.bundle_launch_interests
  FOR SELECT TO service_role USING (true);
DROP POLICY IF EXISTS bundle_interest_service_insert ON public.bundle_launch_interests;
CREATE POLICY bundle_interest_service_insert ON public.bundle_launch_interests
  FOR INSERT TO service_role WITH CHECK (true);

-- The server uses INSERT ... ON CONFLICT (email) DO NOTHING. It cannot update a
-- name, permission version, request date, or withdrawal; it never resubscribes.
COMMIT;
