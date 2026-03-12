-- Storage bucket for training content (videos, PDFs, presentations)
-- Create bucket in Supabase Dashboard or via API; this sets RLS-style access.

-- Policy: authenticated users can read from training-content bucket
-- (Actual bucket creation is done in Dashboard: Storage > New bucket > "training-content" public or private)
-- If bucket is private, use signed URLs from server. For simplicity we use a private bucket and signed URLs.

-- No table needed; Supabase Storage has its own policies in Dashboard.
-- Document for deploy: create bucket "training-content", private.
-- Admins upload via app; staff get signed URLs via server action/API.
