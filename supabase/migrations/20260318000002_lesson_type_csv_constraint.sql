-- Allow lesson_type = 'csv' in media check (storage_path required like video/pdf/image).
-- Prerequisite: run once in SQL Editor: ALTER TYPE public.lesson_type ADD VALUE IF NOT EXISTS 'csv';
ALTER TABLE public.training_lessons DROP CONSTRAINT IF EXISTS training_lessons_media_check;
ALTER TABLE public.training_lessons ADD CONSTRAINT training_lessons_media_check CHECK (
  (lesson_type IN ('video', 'pdf', 'image', 'csv') AND storage_path IS NOT NULL AND storage_path <> '')
  OR (lesson_type = 'text')
);
