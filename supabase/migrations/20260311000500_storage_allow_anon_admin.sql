-- Allow admin upload/delete when client uses anon key (JWT still has user).
-- Supabase JS client with anon key runs as role "anon"; is_admin_user() was only
-- granted to "authenticated", so storage and training_lessons policies failed.

-- 1) Let anon role call is_admin_user() so RLS policies can evaluate for anon-key requests.
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon;

-- 2) Storage: allow admin upload/delete for both anon and authenticated (app uses anon key).
DROP POLICY IF EXISTS "Authenticated can upload training content" ON storage.objects;
CREATE POLICY "Authenticated admin can upload training content"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'training-content' AND public.is_admin_user());

CREATE POLICY "Anon admin can upload training content"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'training-content' AND public.is_admin_user());

DROP POLICY IF EXISTS "Authenticated can delete training content" ON storage.objects;
CREATE POLICY "Authenticated admin can delete training content"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'training-content' AND public.is_admin_user());

CREATE POLICY "Anon admin can delete training content"
  ON storage.objects FOR DELETE TO anon
  USING (bucket_id = 'training-content' AND public.is_admin_user());

-- 3) Storage: allow anon to read (staff need signed URLs; server uses anon key).
DROP POLICY IF EXISTS "Authenticated can read training content" ON storage.objects;
CREATE POLICY "Authenticated can read training content"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'training-content');

CREATE POLICY "Anon can read training content"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'training-content');
