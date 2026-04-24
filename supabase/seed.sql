-- Seed data for local/development testing (public schema only).
-- Prerequisite: Auth users must exist. Run scripts/seed.ts once to create users and this data,
-- or create users in Supabase Auth (Dashboard) with these emails and ensure profiles exist.
-- This file inserts only public content + progress; use scripts/seed.ts for full seed including auth.
-- Run via: supabase db reset  (runs migrations + this seed), or SQL Editor after users exist.

-- Remove seed content so re-run is safe (by known module IDs)
DELETE FROM public.user_module_progress WHERE module_id IN ('a0000001-0000-4000-8000-000000000001', 'a0000002-0000-4000-8000-000000000002');
DELETE FROM public.user_lesson_progress WHERE lesson_id IN (SELECT id FROM public.training_lessons WHERE module_id IN ('a0000001-0000-4000-8000-000000000001', 'a0000002-0000-4000-8000-000000000002'));
DELETE FROM public.quiz_attempt_answers WHERE attempt_id IN (SELECT id FROM public.quiz_attempts WHERE quiz_id IN (SELECT id FROM public.quizzes WHERE module_id = 'a0000001-0000-4000-8000-000000000001'));
DELETE FROM public.quiz_attempts WHERE quiz_id IN (SELECT id FROM public.quizzes WHERE module_id = 'a0000001-0000-4000-8000-000000000001');
DELETE FROM public.quiz_answers WHERE question_id IN (SELECT id FROM public.quiz_questions WHERE quiz_id IN (SELECT id FROM public.quizzes WHERE module_id = 'a0000001-0000-4000-8000-000000000001'));
DELETE FROM public.quiz_questions WHERE quiz_id IN (SELECT id FROM public.quizzes WHERE module_id = 'a0000001-0000-4000-8000-000000000001');
DELETE FROM public.quizzes WHERE module_id IN ('a0000001-0000-4000-8000-000000000001', 'a0000002-0000-4000-8000-000000000002');
DELETE FROM public.training_lessons WHERE module_id IN ('a0000001-0000-4000-8000-000000000001', 'a0000002-0000-4000-8000-000000000002');
DELETE FROM public.training_modules WHERE id IN ('a0000001-0000-4000-8000-000000000001', 'a0000002-0000-4000-8000-000000000002');

-- Modules
INSERT INTO public.training_modules (id, title, description, sort_order, is_published, estimated_duration_minutes, category_id)
VALUES
  ('a0000001-0000-4000-8000-000000000001', 'Safety Basics', 'Core safety and compliance training.', 0, true, 15, 'b1111111-1111-1111-1111-111111111101'),
  ('a0000002-0000-4000-8000-000000000002', 'Care Standards', 'Quality care and documentation.', 1, true, 20, 'b1111111-1111-1111-1111-111111111103');

-- Lessons (text type)
INSERT INTO public.training_lessons (module_id, title, lesson_type, content_text, sort_order)
VALUES
  ('a0000001-0000-4000-8000-000000000001', 'Introduction to Safety', 'text', 'Welcome. This lesson covers basic safety principles.', 0),
  ('a0000001-0000-4000-8000-000000000001', 'Emergency Procedures', 'text', 'What to do in an emergency.', 1),
  ('a0000002-0000-4000-8000-000000000002', 'Care Guidelines', 'text', 'Guidelines for quality care.', 0),
  ('a0000002-0000-4000-8000-000000000002', 'Documentation', 'text', 'How to document care properly.', 1);

-- Quiz, questions, answers, progress (all in one DO block so we can use IDs)
DO $$
DECLARE
  qid UUID;
  q1_id UUID;
  q2_id UUID;
  a1_correct UUID;
  a2_correct UUID;
  attempt_id UUID;
  lesson1_id UUID;
BEGIN
  INSERT INTO public.quizzes (id, module_id, title, description, passing_score_percent)
  VALUES (gen_random_uuid(), 'a0000001-0000-4000-8000-000000000001', 'Safety Basics Quiz', 'Check your understanding.', 80)
  RETURNING id INTO qid;

  INSERT INTO public.quiz_questions (quiz_id, question_text, sort_order)
  VALUES (qid, 'What is the first step in an emergency?', 0), (qid, 'Who should you report safety concerns to?', 1);
  SELECT id INTO q1_id FROM public.quiz_questions WHERE quiz_id = qid AND sort_order = 0;
  SELECT id INTO q2_id FROM public.quiz_questions WHERE quiz_id = qid AND sort_order = 1;

  INSERT INTO public.quiz_answers (question_id, answer_text, is_correct, sort_order)
  VALUES (q1_id, 'Call for help', true, 0), (q1_id, 'Leave the building', false, 1),
         (q2_id, 'Your supervisor', true, 0), (q2_id, 'No one', false, 1);
  SELECT id INTO a1_correct FROM public.quiz_answers WHERE question_id = q1_id AND is_correct = true LIMIT 1;
  SELECT id INTO a2_correct FROM public.quiz_answers WHERE question_id = q2_id AND is_correct = true LIMIT 1;

  SELECT id INTO lesson1_id FROM public.training_lessons WHERE module_id = 'a0000001-0000-4000-8000-000000000001' ORDER BY sort_order LIMIT 1;

  INSERT INTO public.user_lesson_progress (user_id, lesson_id, completed_at)
  SELECT '22222222-2222-2222-2222-222222222222', id, now() FROM public.training_lessons WHERE module_id = 'a0000001-0000-4000-8000-000000000001'
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed_at = now();
  INSERT INTO public.user_lesson_progress (user_id, lesson_id, completed_at)
  VALUES ('33333333-3333-3333-3333-333333333333', lesson1_id, now())
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed_at = now();

  INSERT INTO public.quiz_attempts (user_id, quiz_id, score_percent, passed)
  VALUES ('22222222-2222-2222-2222-222222222222', qid, 100, true)
  RETURNING id INTO attempt_id;
  INSERT INTO public.quiz_attempt_answers (attempt_id, question_id, answer_id)
  VALUES (attempt_id, q1_id, a1_correct), (attempt_id, q2_id, a2_correct);

  INSERT INTO public.user_module_progress (user_id, module_id, completed_at)
  VALUES ('22222222-2222-2222-2222-222222222222', 'a0000001-0000-4000-8000-000000000001', now())
  ON CONFLICT (user_id, module_id) DO UPDATE SET completed_at = now();
END $$;
