-- Training content storage: one private bucket, organized by module.
-- Path pattern: {module_id}/{uuid}.{ext}
-- See docs/STORAGE.md for full structure and usage.

-- Create bucket (private; access only via signed URLs or RLS).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-content',
  'training-content',
  false,
  104857600,
  ARRAY[
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    'video/x-matroska', 'video/x-m4v',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated can upload training content" ON storage.objects;
CREATE POLICY "Authenticated can upload training content"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'training-content');

DROP POLICY IF EXISTS "Authenticated can read training content" ON storage.objects;
CREATE POLICY "Authenticated can read training content"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'training-content');

DROP POLICY IF EXISTS "Authenticated can delete training content" ON storage.objects;
CREATE POLICY "Authenticated can delete training content"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'training-content');
