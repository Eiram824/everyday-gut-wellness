-- Private tables are accessible only through the server-side service_role.
-- Idempotent: preserves rows and covers the legacy leads table when present.
DO $security$
DECLARE
  private_table text;
BEGIN
  FOREACH private_table IN ARRAY ARRAY['subscribers', 'leads', 'admin_auth_attempts'] LOOP
    IF to_regclass(format('public.%I', private_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', private_table);
      EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', private_table);
      EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC, anon, authenticated', private_table);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO service_role', private_table);
      EXECUTE format('DROP POLICY IF EXISTS private_data_deny_clients ON public.%I', private_table);
      -- Restrictive policies AND with all permissive policies, including older ones.
      EXECUTE format('CREATE POLICY private_data_deny_clients ON public.%I AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)', private_table);
    END IF;
  END LOOP;
  IF to_regclass('public.admin_auth_attempts_id_seq') IS NOT NULL THEN
    REVOKE ALL PRIVILEGES ON SEQUENCE public.admin_auth_attempts_id_seq FROM PUBLIC, anon, authenticated;
    GRANT USAGE, SELECT ON SEQUENCE public.admin_auth_attempts_id_seq TO service_role;
  END IF;
END;
$security$;
