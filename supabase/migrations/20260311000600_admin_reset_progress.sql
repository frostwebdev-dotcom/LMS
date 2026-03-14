-- Allow admins to delete progress rows for "Reset training" (e.g. annual reset).
-- Uses same admin check as other admin policies (profiles + roles).

CREATE POLICY "Admins delete module progress"
  ON public.user_module_progress FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins delete lesson progress"
  ON public.user_lesson_progress FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins delete quiz attempts"
  ON public.quiz_attempts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- quiz_attempt_answers: delete when admin deletes the parent attempt (CASCADE handles it)
-- or we need to allow admin to delete attempt_answers for reporting/reset. For reset we
-- delete quiz_attempts rows, and if FK is ON DELETE CASCADE, attempt_answers are removed.
-- If not CASCADE, add policy. Checking: quiz_attempt_answers has attempt_id FK to quiz_attempts.
-- So when we delete from quiz_attempts, we need CASCADE on quiz_attempt_answers. Let me check.
-- From schema: quiz_attempt_answers.attempt_id REFERENCES quiz_attempts(id) ON DELETE CASCADE.
-- So deleting quiz_attempts will auto-delete quiz_attempt_answers. No policy needed for attempt_answers.
