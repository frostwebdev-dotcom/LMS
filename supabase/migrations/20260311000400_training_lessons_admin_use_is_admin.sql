-- Use is_admin_user() for training_lessons admin policy so INSERT/UPDATE/DELETE
-- succeed for admins (avoids "new row violates row-level security policy" when
-- the inline profiles subquery is evaluated under RLS).
-- Requires: 20260311000100_fix_profiles_rls_recursion.sql (creates is_admin_user).

DROP POLICY IF EXISTS "Admins can manage lessons" ON public.training_lessons;
CREATE POLICY "Admins can manage lessons"
  ON public.training_lessons FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());
