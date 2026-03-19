-- Add CSV as a lesson type (must be in its own migration so the value is committed before use).
ALTER TYPE public.lesson_type ADD VALUE IF NOT EXISTS 'csv';
