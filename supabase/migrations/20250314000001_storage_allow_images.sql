-- Allow image MIME types for image content (view-only in platform).
-- Image lessons use JPG, PNG, GIF, WebP.

UPDATE storage.buckets
SET allowed_mime_types = array_cat(
  COALESCE(allowed_mime_types, ARRAY[]::text[]),
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
WHERE id = 'training-content'
  AND NOT (allowed_mime_types @> ARRAY['image/jpeg']::text[]);
