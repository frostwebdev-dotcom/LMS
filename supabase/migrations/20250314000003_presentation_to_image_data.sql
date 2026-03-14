-- Step 2: drop old constraint, migrate rows, add new constraint (run after 20250314000002).
-- Drop first so UPDATE to 'image' doesn't violate the old check (which only allowed 'presentation').
ALTER TABLE public.training_lessons DROP CONSTRAINT IF EXISTS training_lessons_media_check;

UPDATE public.training_lessons SET lesson_type = 'image' WHERE lesson_type = 'presentation';

ALTER TABLE public.training_lessons ADD CONSTRAINT training_lessons_media_check CHECK (
  (lesson_type IN ('video', 'pdf', 'image') AND storage_path IS NOT NULL AND storage_path <> '')
  OR (lesson_type = 'text')
);
