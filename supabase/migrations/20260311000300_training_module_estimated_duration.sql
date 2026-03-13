-- Add optional estimated duration (minutes) for staff module listing.
ALTER TABLE public.training_modules
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER;

COMMENT ON COLUMN public.training_modules.estimated_duration_minutes IS
  'Optional estimated time to complete the module in minutes. Shown on staff training listing.';
