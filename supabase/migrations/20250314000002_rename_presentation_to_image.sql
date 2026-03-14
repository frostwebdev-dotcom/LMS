-- Rename content type "presentation" to "image" (content is now image uploads).
-- Step 1: add enum value (committed so it can be used in step 2).
ALTER TYPE public.lesson_type ADD VALUE IF NOT EXISTS 'image';
