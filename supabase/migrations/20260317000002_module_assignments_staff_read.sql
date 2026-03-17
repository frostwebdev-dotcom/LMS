-- =============================================================================
-- Fix: Staff must be able to read their own assignments so the
-- training_modules (and related) RLS visibility check can succeed.
-- Without this, EXISTS (SELECT from module_user_assignments) runs as staff
-- and returns no rows because only admin could read that table.
-- =============================================================================

-- Staff can read their own user assignments (needed for "can I see this module?")
DROP POLICY IF EXISTS "Users read own module user assignments" ON public.module_user_assignments;
CREATE POLICY "Users read own module user assignments"
  ON public.module_user_assignments FOR SELECT
  USING (user_id = auth.uid());

-- Staff can read role assignments for their own role (needed for "is this module assigned to my role?")
DROP POLICY IF EXISTS "Users read role assignments for own role" ON public.module_role_assignments;
CREATE POLICY "Users read role assignments for own role"
  ON public.module_role_assignments FOR SELECT
  USING (
    role_id IN (SELECT role_id FROM public.profiles WHERE id = auth.uid())
  );
