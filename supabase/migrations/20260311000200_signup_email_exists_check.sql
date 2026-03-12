-- Allow signup flow to check if an email is already in use (auth.users or profiles).
-- Returns only true/false so it is safe to call as anon for duplicate-email validation.

CREATE OR REPLACE FUNCTION public.email_exists_for_signup(check_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE lower(email) = lower(trim(check_email))
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(email) = lower(trim(check_email))
  );
$$;

COMMENT ON FUNCTION public.email_exists_for_signup(text) IS
  'Used by signup to block duplicate emails. Returns true if email exists in auth.users or profiles.';

GRANT EXECUTE ON FUNCTION public.email_exists_for_signup(text) TO anon;
GRANT EXECUTE ON FUNCTION public.email_exists_for_signup(text) TO authenticated;
