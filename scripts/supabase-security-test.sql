-- Run after hardening. Tests privileges without reading or modifying any row.
DO $test$
DECLARE
  client_role text;
  private_table text;
  attempted_sql text;
BEGIN
  FOREACH client_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    FOREACH private_table IN ARRAY ARRAY['subscribers', 'admin_auth_attempts', 'leads'] LOOP
      IF to_regclass(format('public.%I', private_table)) IS NULL THEN CONTINUE; END IF;
      FOREACH attempted_sql IN ARRAY ARRAY[
        format('SELECT 1 FROM public.%I LIMIT 0', private_table),
        format('DELETE FROM public.%I WHERE false', private_table)
      ] LOOP
        EXECUTE format('SET LOCAL ROLE %I', client_role);
        BEGIN
          EXECUTE attempted_sql;
          RAISE EXCEPTION 'FAIL: % unexpectedly allowed access to %', client_role, private_table;
        EXCEPTION WHEN insufficient_privilege THEN
          NULL; -- Expected: access denied before a row can be read or changed.
        END;
        RESET ROLE;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$test$;
SELECT 'PASS: anon and authenticated cannot read or delete private records' AS security_test;
