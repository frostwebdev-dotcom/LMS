-- =============================================================================
-- Require every training module to belong to a category.
-- Prerequisite: 20260424000001_training_categories.sql (categories + column).
--
-- Strategy:
-- 1) Backfill NULL category_id to the stable seeded "Homecare" category UUID.
-- 2) Replace FK with ON DELETE RESTRICT (cannot delete a category in use).
-- 3) SET NOT NULL + DEFAULT so inserts without category_id still succeed at DB level.
-- =============================================================================

DO $$
DECLARE
  default_category UUID := 'b1111111-1111-1111-1111-111111111101';
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'training_modules'
      AND column_name = 'category_id'
  ) THEN
    RAISE EXCEPTION 'training_modules.category_id missing; apply 20260424000001_training_categories.sql first';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.training_categories WHERE id = default_category) THEN
    RAISE EXCEPTION 'Default training category % not found; ensure training_categories is seeded', default_category;
  END IF;
END $$;

UPDATE public.training_modules
SET category_id = 'b1111111-1111-1111-1111-111111111101'::uuid
WHERE category_id IS NULL;

ALTER TABLE public.training_modules
  DROP CONSTRAINT IF EXISTS training_modules_category_id_fkey;

ALTER TABLE public.training_modules
  ADD CONSTRAINT training_modules_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.training_categories(id) ON DELETE RESTRICT;

ALTER TABLE public.training_modules
  ALTER COLUMN category_id SET NOT NULL;

ALTER TABLE public.training_modules
  ALTER COLUMN category_id SET DEFAULT 'b1111111-1111-1111-1111-111111111101'::uuid;

COMMENT ON COLUMN public.training_modules.category_id IS
  'Required FK to training_categories. Legacy NULL rows were backfilled to Homecare. DB default matches that seed UUID.';
