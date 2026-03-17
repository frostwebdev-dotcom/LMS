-- Annual training expiration: modules can expire N months after completion.
-- Default 12 months (annual). Null or missing treated as 12 in application code.
ALTER TABLE public.training_modules
  ADD COLUMN IF NOT EXISTS expiration_months INTEGER DEFAULT 12;

COMMENT ON COLUMN public.training_modules.expiration_months IS
  'Number of months after completion until this module training expires. Default 12 (annual). Null is treated as 12.';
