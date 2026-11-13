-- Metadata only: never select subscriber names, email addresses, or tokens.
SELECT n.nspname AS schema_name, c.relname AS table_name, c.relkind,
       c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced,
       has_table_privilege('anon', c.oid, 'SELECT') AS anon_can_select,
       has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_can_select,
       has_table_privilege('anon', c.oid, 'INSERT') AS anon_can_insert,
       has_table_privilege('authenticated', c.oid, 'INSERT') AS authenticated_can_insert,
       has_table_privilege('service_role', c.oid, 'SELECT') AS service_can_select,
       has_table_privilege('service_role', c.oid, 'INSERT') AS service_can_insert
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm')
ORDER BY c.relname;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;

-- Public functions/views can otherwise bypass table RLS.
SELECT n.nspname, p.proname, p.prosecdef AS security_definer,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosecdef;
