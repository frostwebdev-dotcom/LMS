-- =============================================================================
-- Certificates: one record per completed training module per user.
-- Links to user_module_progress (CASCADE delete when progress is reset).
-- PDFs live in private storage bucket learning-certificates; downloads use
-- short-lived signed URLs from the app (see pdf_access_strategy column).
-- =============================================================================

CREATE TYPE public.certificate_status AS ENUM ('pending_pdf', 'issued', 'pdf_failed');

CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  module_progress_id UUID NOT NULL REFERENCES public.user_module_progress(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completion_date TIMESTAMPTZ NOT NULL,
  /** Path within learning-certificates bucket, e.g. {user_id}/{certificate_id}.pdf */
  pdf_storage_path TEXT,
  /** How clients obtain the PDF; v1 uses signed URLs against private storage. */
  pdf_access_strategy TEXT NOT NULL DEFAULT 'signed_url_private_bucket',
  status public.certificate_status NOT NULL DEFAULT 'pending_pdf',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT certificates_certificate_number_key UNIQUE (certificate_number),
  CONSTRAINT certificates_user_module_unique UNIQUE (user_id, module_id)
);

CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_module_id ON public.certificates(module_id);
CREATE INDEX idx_certificates_module_progress_id ON public.certificates(module_progress_id);
CREATE INDEX idx_certificates_status ON public.certificates(status);

COMMENT ON TABLE public.certificates IS
  'Completion certificate per user per module. Tied to user_module_progress row; deleted when progress is reset.';

COMMENT ON COLUMN public.certificates.pdf_access_strategy IS
  'signed_url_private_bucket = PDF in learning-certificates; app issues signed URLs for download.';

DROP TRIGGER IF EXISTS certificates_updated_at ON public.certificates;
CREATE TRIGGER certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own certificates" ON public.certificates;
CREATE POLICY "Users read own certificates"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all certificates" ON public.certificates;
CREATE POLICY "Admins read all certificates"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users insert own certificates" ON public.certificates;
CREATE POLICY "Users insert own certificates"
  ON public.certificates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage certificates" ON public.certificates;
CREATE POLICY "Admins manage certificates"
  ON public.certificates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- Storage: private PDF bucket
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'learning-certificates',
  'learning-certificates',
  false,
  5242880,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users read own certificate files" ON storage.objects;
CREATE POLICY "Users read own certificate files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'learning-certificates'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Admins read all certificate files" ON storage.objects;
CREATE POLICY "Admins read all certificate files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'learning-certificates'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );
