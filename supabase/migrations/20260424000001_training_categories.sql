-- =============================================================================
-- Training categories: structured groupings (Homecare, Home Healthcare, etc.)
-- Modules optionally reference a category via training_modules.category_id (nullable).
-- =============================================================================

CREATE TABLE public.training_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT training_categories_slug_format CHECK (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  CONSTRAINT training_categories_slug_len CHECK (char_length(slug) BETWEEN 1 AND 120),
  CONSTRAINT training_categories_name_len CHECK (char_length(name) BETWEEN 1 AND 200)
);

CREATE UNIQUE INDEX training_categories_slug_uidx ON public.training_categories (slug);

CREATE INDEX idx_training_categories_active_display
  ON public.training_categories (is_active, display_order ASC, name ASC);

COMMENT ON TABLE public.training_categories IS
  'Portal-wide training groupings. Modules may reference one category; null category_id means uncategorized / legacy.';

COMMENT ON COLUMN public.training_categories.slug IS
  'URL-safe unique key for APIs and routing.';

COMMENT ON COLUMN public.training_categories.icon IS
  'Optional display icon identifier (e.g. Lucide icon name).';

ALTER TABLE public.training_modules
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.training_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_training_modules_category_id ON public.training_modules(category_id);

COMMENT ON COLUMN public.training_modules.category_id IS
  'Optional FK to training_categories. Null preserves legacy modules without a category.';

DROP TRIGGER IF EXISTS training_categories_updated_at ON public.training_categories;
CREATE TRIGGER training_categories_updated_at
  BEFORE UPDATE ON public.training_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.training_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read active training categories" ON public.training_categories;
CREATE POLICY "Staff read active training categories"
  ON public.training_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage training categories" ON public.training_categories;
CREATE POLICY "Admins manage training categories"
  ON public.training_categories FOR ALL
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
-- Seed default categories (stable UUIDs for local seed.sql / scripts)
-- -----------------------------------------------------------------------------
INSERT INTO public.training_categories (id, name, slug, description, icon, display_order, is_active)
VALUES
  (
    'b1111111-1111-1111-1111-111111111101',
    'Homecare',
    'homecare',
    'Non-medical home care skills, safety, and client-facing standards.',
    'home',
    0,
    true
  ),
  (
    'b1111111-1111-1111-1111-111111111102',
    'Home Healthcare',
    'home-healthcare',
    'Clinical and skilled home health topics where applicable to your role.',
    'stethoscope',
    1,
    true
  ),
  (
    'b1111111-1111-1111-1111-111111111103',
    'Leadership',
    'leadership',
    'Supervision, communication, and organizational expectations.',
    'users',
    2,
    true
  )
ON CONFLICT (id) DO NOTHING;
