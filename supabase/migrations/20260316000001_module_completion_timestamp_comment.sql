-- Document completion timestamp: exact datetime when a user completed the module
-- (all lessons done + quiz passed). Already stored in completed_at; this comment
-- clarifies intent for reporting and display.
COMMENT ON COLUMN public.user_module_progress.completed_at IS
  'Exact UTC timestamp when the user completed this module (all required lessons completed and quiz passed, if any). Null until completed.';
