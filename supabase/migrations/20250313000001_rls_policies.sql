-- =============================================================================
-- Row Level Security (RLS) – Caregiver Training Portal
-- Production-ready policies for staff and admin roles.
--
-- Model:
--   - Staff: read published modules/lessons/quizzes; read/update own progress
--     and quiz attempts only. No access to other users' data or draft content.
--   - Admin: full read/write on modules, lessons, quizzes, questions, answers;
--     read all profiles and progress; update profiles (e.g. role assignment).
--
-- All policies use roles table: (SELECT id FROM profiles WHERE id = auth.uid())
-- joined to roles; admin check is roles.name = 'admin'.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enable RLS on all application tables
-- Without this, RLS policies have no effect. Once enabled, every row access
-- is restricted by at least one policy per command type (SELECT/INSERT/UPDATE/DELETE).
-- -----------------------------------------------------------------------------
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempt_answers ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- ROLES
-- Purpose: Lookup table for role names. No sensitive data; needed so the app
-- can show role labels and so policies can check admin via roles.name.
-- -----------------------------------------------------------------------------
-- Staff and admin both need to read roles (e.g. to display "Staff" / "Admin").
-- Only backend or admin tooling should change roles; we allow no INSERT/UPDATE/DELETE
-- from the app (no policy = denied).
DROP POLICY IF EXISTS "Authenticated can read roles" ON public.roles;
CREATE POLICY "Authenticated can read roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- PROFILES
-- Purpose: One row per user; holds display info and role_id. Staff see only
-- their own row; admin see all and can update (e.g. change role).
-- -----------------------------------------------------------------------------
-- Staff: read and update only their own profile (e.g. change full_name).
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin: read all profiles (for user list and progress reporting).
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Admin: update any profile (e.g. assign role_id for new staff/admin).
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- No INSERT/DELETE on profiles from app (rows created by trigger on auth signup).

-- -----------------------------------------------------------------------------
-- TRAINING_MODULES
-- Purpose: Staff see only published modules; admin see and manage all (CRUD).
-- -----------------------------------------------------------------------------
-- Staff see rows where is_published = true; admin see every row.
DROP POLICY IF EXISTS "Staff read published modules" ON public.training_modules;
DROP POLICY IF EXISTS "Staff can read published modules" ON public.training_modules;
CREATE POLICY "Staff read published modules"
  ON public.training_modules FOR SELECT
  USING (
    is_published = true
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Admin: full access (SELECT, INSERT, UPDATE, DELETE).
DROP POLICY IF EXISTS "Admins can manage modules" ON public.training_modules;
CREATE POLICY "Admins can manage modules"
  ON public.training_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- TRAINING_LESSONS
-- Purpose: Staff see lessons that belong to a published module; admin manage all.
-- -----------------------------------------------------------------------------
-- Staff see a lesson only if its module is published (or viewer is admin).
DROP POLICY IF EXISTS "Read lessons of visible modules" ON public.training_lessons;
DROP POLICY IF EXISTS "Staff can read content of published modules" ON public.training_lessons;
DROP POLICY IF EXISTS "Admins can manage content" ON public.training_lessons;
DROP POLICY IF EXISTS "Admins manage lessons" ON public.training_lessons;
CREATE POLICY "Staff read lessons of published modules"
  ON public.training_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_modules m
      WHERE m.id = training_lessons.module_id
      AND (
        m.is_published = true
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.id = auth.uid() AND r.name = 'admin'
        )
      )
    )
  );

CREATE POLICY "Admins can manage lessons"
  ON public.training_lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- QUIZZES
-- Purpose: Same as modules – staff see quizzes for published modules only;
-- admin manage all.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read quizzes of visible modules" ON public.quizzes;
DROP POLICY IF EXISTS "Staff can read quizzes of published modules" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.quizzes;
CREATE POLICY "Staff read quizzes of published modules"
  ON public.quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_modules m
      WHERE m.id = quizzes.module_id
      AND (
        m.is_published = true
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.id = auth.uid() AND r.name = 'admin'
        )
      )
    )
  );

CREATE POLICY "Admins can manage quizzes"
  ON public.quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- QUIZ_QUESTIONS
-- Purpose: Staff see questions only when the parent quiz (and thus module) is
-- visible; admin manage all.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read questions of visible quizzes" ON public.quiz_questions;
DROP POLICY IF EXISTS "Read quiz questions when can read quiz" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins manage questions" ON public.quiz_questions;
CREATE POLICY "Staff read questions of visible quizzes"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.training_modules m ON m.id = q.module_id
      WHERE q.id = quiz_questions.quiz_id
      AND (
        m.is_published = true
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.id = auth.uid() AND r.name = 'admin'
        )
      )
    )
  );

CREATE POLICY "Admins can manage quiz questions"
  ON public.quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- QUIZ_ANSWERS
-- Purpose: Staff see answer options only when the question (and quiz/module) is
-- visible; admin manage all.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read answers of visible questions" ON public.quiz_answers;
DROP POLICY IF EXISTS "Read quiz options when can read question" ON public.quiz_answers;
DROP POLICY IF EXISTS "Admins can manage quiz options" ON public.quiz_answers;
DROP POLICY IF EXISTS "Admins manage answers" ON public.quiz_answers;
CREATE POLICY "Staff read answers of visible questions"
  ON public.quiz_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      JOIN public.training_modules m ON m.id = q.module_id
      WHERE qq.id = quiz_answers.question_id
      AND (
        m.is_published = true
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.id = auth.uid() AND r.name = 'admin'
        )
      )
    )
  );

CREATE POLICY "Admins can manage quiz answers"
  ON public.quiz_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- USER_MODULE_PROGRESS
-- Purpose: Staff can only view and update their own progress; admin can view
-- all (for reporting). No one can insert/update another user's row.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users read own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can read own module progress" ON public.user_module_progress;
CREATE POLICY "Users read own module progress"
  ON public.user_module_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can insert own module progress" ON public.user_module_progress;
CREATE POLICY "Users insert own module progress"
  ON public.user_module_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can update own module progress" ON public.user_module_progress;
CREATE POLICY "Users update own module progress"
  ON public.user_module_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all module progress" ON public.user_module_progress;
CREATE POLICY "Admins read all module progress"
  ON public.user_module_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- USER_LESSON_PROGRESS
-- Purpose: Same as module progress – staff view/insert/update only their own;
-- admin can view all.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users read own lesson progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Users can read own content progress" ON public.user_lesson_progress;
CREATE POLICY "Users read own lesson progress"
  ON public.user_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own lesson progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Users can insert own content progress" ON public.user_lesson_progress;
CREATE POLICY "Users insert own lesson progress"
  ON public.user_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own lesson progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Users can update own content progress" ON public.user_lesson_progress;
CREATE POLICY "Users update own lesson progress"
  ON public.user_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all lesson progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Admins can read all content progress" ON public.user_lesson_progress;
CREATE POLICY "Admins read all lesson progress"
  ON public.user_lesson_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- QUIZ_ATTEMPTS
-- Purpose: Staff can only view and create their own attempts; admin can view
-- all (for reporting). No update/delete needed for attempts (immutable record).
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users read own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can read own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users read own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users insert own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Admins read all quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- QUIZ_ATTEMPT_ANSWERS
-- Purpose: Staff can only view and insert rows that belong to their own
-- attempt (enforced by checking attempt_id → quiz_attempts.user_id). Admin
-- can view all for reporting.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users read own attempt answers" ON public.quiz_attempt_answers;
DROP POLICY IF EXISTS "Users can read own attempt answers" ON public.quiz_attempt_answers;
CREATE POLICY "Users read own attempt answers"
  ON public.quiz_attempt_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts a
      WHERE a.id = quiz_attempt_answers.attempt_id AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users insert own attempt answers" ON public.quiz_attempt_answers;
DROP POLICY IF EXISTS "Users can insert own attempt answers" ON public.quiz_attempt_answers;
CREATE POLICY "Users insert own attempt answers"
  ON public.quiz_attempt_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts a
      WHERE a.id = attempt_id AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins read all attempt answers" ON public.quiz_attempt_answers;
CREATE POLICY "Admins read all attempt answers"
  ON public.quiz_attempt_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );
