-- Align the existing trigger with the fresh-install schema without replacing it.
-- Preserves its body, owner, privileges, invoker mode and attached trigger.
BEGIN;
ALTER FUNCTION public.update_subscribers_updated_at() SET search_path = '';
COMMIT;
