-- =============================================================================
-- Upgrade: existing DB → full schema (roles, role_id, training_lessons,
-- quiz_answers, user_module_progress, user_lesson_progress, RLS)
-- Prerequisite: 20250311000001_initial_schema.sql already applied.
-- If 20250312000001 ran partially (roles + lesson_type exist), this migration
-- is idempotent and completes the upgrade.
-- =============================================================================

-- 1. Ensure lesson_type enum exists (in case full_schema ran)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_type') THEN
    CREATE TYPE public.lesson_type AS ENUM ('video', 'pdf', 'presentation', 'text');
  END IF;
END $$;

-- 2. Ensure roles table exists and is seeded
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.roles (name, description) VALUES
  ('staff', 'Caregiver staff; can view modules, complete lessons and quizzes'),
  ('admin', 'Administrator; can manage content and view all progress')
ON CONFLICT (name) DO NOTHING;

-- 2b. Drop all RLS policies that depend on profiles.role (must happen before dropping column)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile (limited)" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can read published modules" ON public.training_modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.training_modules;
DROP POLICY IF EXISTS "Staff can read content of published modules" ON public.module_content;
DROP POLICY IF EXISTS "Admins can manage content" ON public.module_content;
DROP POLICY IF EXISTS "Staff can read quizzes of published modules" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Read quiz questions when can read quiz" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Read quiz options when can read question" ON public.quiz_options;
DROP POLICY IF EXISTS "Admins can manage quiz options" ON public.quiz_options;
DROP POLICY IF EXISTS "Users can read own module progress" ON public.module_progress;
DROP POLICY IF EXISTS "Users can insert own module progress" ON public.module_progress;
DROP POLICY IF EXISTS "Users can update own module progress" ON public.module_progress;
DROP POLICY IF EXISTS "Admins can read all module progress" ON public.module_progress;
DROP POLICY IF EXISTS "Users can read own content progress" ON public.content_progress;
DROP POLICY IF EXISTS "Users can insert own content progress" ON public.content_progress;
DROP POLICY IF EXISTS "Users can update own content progress" ON public.content_progress;
DROP POLICY IF EXISTS "Admins can read all content progress" ON public.content_progress;
DROP POLICY IF EXISTS "Users can read own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Admins can read all quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can read own attempt answers" ON public.quiz_attempt_answers;
DROP POLICY IF EXISTS "Users can insert own attempt answers" ON public.quiz_attempt_answers;
DROP POLICY IF EXISTS "Admins can read all attempt answers" ON public.quiz_attempt_answers;

-- 3. Migrate profiles: role (enum) → role_id (FK to roles)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id) ON DELETE RESTRICT;
    UPDATE public.profiles p SET role_id = r.id FROM public.roles r WHERE r.name = p.role::text;
    UPDATE public.profiles SET role_id = (SELECT id FROM public.roles WHERE name = 'staff' LIMIT 1) WHERE role_id IS NULL;
    ALTER TABLE public.profiles ALTER COLUMN role_id SET NOT NULL;
    ALTER TABLE public.profiles DROP COLUMN role;
    CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
  END IF;
END $$;

-- 4. module_content → training_lessons (rename + new columns)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'module_content') THEN
    ALTER TABLE public.module_content RENAME TO training_lessons;
    ALTER TABLE public.training_lessons ADD COLUMN IF NOT EXISTS content_text TEXT;
    ALTER TABLE public.training_lessons ADD COLUMN IF NOT EXISTS lesson_type public.lesson_type;
    UPDATE public.training_lessons SET lesson_type = content_type::text::public.lesson_type WHERE lesson_type IS NULL;
    ALTER TABLE public.training_lessons ALTER COLUMN lesson_type SET NOT NULL;
    ALTER TABLE public.training_lessons DROP COLUMN content_type;
    ALTER TABLE public.training_lessons ALTER COLUMN storage_path DROP NOT NULL;
    DROP TYPE IF EXISTS public.content_type;
    -- Media lessons require storage_path; text lessons optional content_text
    ALTER TABLE public.training_lessons DROP CONSTRAINT IF EXISTS training_lessons_media_check;
    ALTER TABLE public.training_lessons ADD CONSTRAINT training_lessons_media_check CHECK (
      (lesson_type IN ('video', 'pdf', 'presentation') AND storage_path IS NOT NULL AND storage_path <> '')
      OR (lesson_type = 'text')
    );
    CREATE INDEX IF NOT EXISTS idx_training_lessons_module ON public.training_lessons(module_id);
  END IF;
END $$;

-- 5. quiz_options → quiz_answers (rename table and column)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_options') THEN
    ALTER TABLE public.quiz_options RENAME TO quiz_answers;
    ALTER TABLE public.quiz_answers RENAME COLUMN option_text TO answer_text;
    ALTER TABLE public.quiz_answers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON public.quiz_answers(question_id);
  END IF;
END $$;

-- 6. quiz_questions: add updated_at if missing
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 7. module_progress → user_module_progress
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'module_progress') THEN
    ALTER TABLE public.module_progress RENAME TO user_module_progress;
    CREATE INDEX IF NOT EXISTS idx_user_module_progress_user ON public.user_module_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_module_progress_module ON public.user_module_progress(module_id);
  END IF;
END $$;

-- 8. content_progress → user_lesson_progress (after training_lessons exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_progress') THEN
    ALTER TABLE public.content_progress DROP CONSTRAINT IF EXISTS content_progress_content_id_fkey;
    ALTER TABLE public.content_progress RENAME COLUMN content_id TO lesson_id;
    ALTER TABLE public.content_progress RENAME TO user_lesson_progress;
    ALTER TABLE public.user_lesson_progress
      ADD CONSTRAINT user_lesson_progress_lesson_id_fkey
      FOREIGN KEY (lesson_id) REFERENCES public.training_lessons(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson ON public.user_lesson_progress(lesson_id);
  END IF;
END $$;

-- 9. quiz_attempt_answers: option_id → answer_id (FK to quiz_answers)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quiz_attempt_answers' AND column_name = 'option_id'
  ) THEN
    ALTER TABLE public.quiz_attempt_answers DROP CONSTRAINT IF EXISTS quiz_attempt_answers_option_id_fkey;
    ALTER TABLE public.quiz_attempt_answers RENAME COLUMN option_id TO answer_id;
    ALTER TABLE public.quiz_attempt_answers
      ADD CONSTRAINT quiz_attempt_answers_answer_id_fkey
      FOREIGN KEY (answer_id) REFERENCES public.quiz_answers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 10. Updated_at trigger for new/renamed tables
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quiz_questions_updated_at ON public.quiz_questions;
CREATE TRIGGER quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS quiz_answers_updated_at ON public.quiz_answers;
CREATE TRIGGER quiz_answers_updated_at
  BEFORE UPDATE ON public.quiz_answers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 11. Recreate handle_new_user to use role_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'staff' LIMIT 1;
  IF default_role_id IS NULL THEN
    RAISE EXCEPTION 'Default role "staff" not found in public.roles';
  END IF;
  INSERT INTO public.profiles (id, email, full_name, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(
      (SELECT id FROM public.roles WHERE name = (NEW.raw_user_meta_data->>'role') LIMIT 1),
      default_role_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Drop old RLS policies that referenced role enum / old table names, then create new ones
-- (Policies reference tables; renaming tables doesn't drop policies, so we drop by name where possible.)

-- Profiles: drop old, add new
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile (limited)" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'admin')
);

-- training_modules: drop old staff/admin policies, recreate with role_id
DROP POLICY IF EXISTS "Staff can read published modules" ON public.training_modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.training_modules;
CREATE POLICY "Staff read published modules" ON public.training_modules FOR SELECT USING (
  is_published = true
  OR EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'admin')
);
CREATE POLICY "Admins manage modules" ON public.training_modules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'admin')
);

-- training_lessons (was module_content)
DROP POLICY IF EXISTS "Staff can read content of published modules" ON public.training_lessons;
DROP POLICY IF EXISTS "Admins can manage content" ON public.training_lessons;
CREATE POLICY "Read lessons of visible modules" ON public.training_lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.training_modules m
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    LEFT JOIN public.roles r ON p.role_id = r.id
    WHERE m.id = training_lessons.module_id AND (m.is_published = true OR r.name = 'admin')
  )
);
CREATE POLICY "Admins manage lessons" ON public.training_lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'admin')
);

-- Quizzes
DROP POLICY IF EXISTS "Staff can read quizzes of published modules" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.quizzes;
CREATE POLICY "Read quizzes of visible modules" ON public.quizzes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.training_modules m
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    LEFT JOIN public.roles r ON p.role_id = r.id
    WHERE m.id = quizzes.module_id AND (m.is_published = true OR r.name = 'admin')
  )
);
CREATE POLICY "Admins manage quizzes" ON public.quizzes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'admin')
);

-- quiz_questions
DROP POLICY IF EXISTS "Read quiz questions when can read quiz" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Read questions of visible quizzes" ON public.quiz_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q JOIN public.training_modules m ON m.id = q.module_id
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    LEFT JOIN public.roles r ON p.role_id = r.id
    WHERE q.id = quiz_questions.quiz_id AND (m.is_published = true OR r.name = 'admin')
  )
);
CREATE POLICY "Admins manage questions" ON public.quiz_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'admin')
);

-- quiz_answers (was quiz_options)
DROP POLICY IF EXISTS "Read quiz options when can read question" ON public.quiz_answers;
DROP POLICY IF EXISTS "Admins can manage quiz options" ON public.quiz_answers;
CREATE POLICY "Read answers of visible questions" ON public.quiz_answers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quiz_questions qq JOIN public.quizzes q ON q.id = qq.quiz_id
    JOIN public.training_modules m ON m.id = q.module_id
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    LEFT JOIN public.roles r ON p.role_id = r.id
    WHERE qq.id = quiz_answers.question_id AND (m.is_published = true OR r.name = 'admin')
  )
);
CREATE POLICY "Admins manage answers" ON public.quiz_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'admin')
);

-- user_module_progress (was module_progress)
DROP POLICY IF EXISTS "Users can read own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can insert own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can update own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Admins can read all module progress" ON public.user_module_progress;
CREATE POLICY "Users read own module progress" ON public.user_module_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own module progress" ON public.user_module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own module progress" ON public.user_module_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all module progress" ON public.user_module_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'admin')
);

-- user_lesson_progress (was content_progress; table already renamed above)
DROP POLICY IF EXISTS "Users can read own content progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Users can insert own content progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Users can update own content progress" ON public.user_lesson_progress;
DROP POLICY IF EXISTS "Admins can read all content progress" ON public.user_lesson_progress;
CREATE POLICY "Users read own lesson progress" ON public.user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own lesson progress" ON public.user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own lesson progress" ON public.user_lesson_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all lesson progress" ON public.user_lesson_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'admin')
);

-- quiz_attempts
DROP POLICY IF EXISTS "Users can read own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Admins can read all quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users read own quiz attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own quiz attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all quiz attempts" ON public.quiz_attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'admin')
);

-- quiz_attempt_answers
DROP POLICY IF EXISTS "Users can read own attempt answers" ON public.quiz_attempt_answers;
DROP POLICY IF EXISTS "Users can insert own attempt answers" ON public.quiz_attempt_answers;
DROP POLICY IF EXISTS "Admins can read all attempt answers" ON public.quiz_attempt_answers;
CREATE POLICY "Users read own attempt answers" ON public.quiz_attempt_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.quiz_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
);
CREATE POLICY "Users insert own attempt answers" ON public.quiz_attempt_answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.quiz_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
);
CREATE POLICY "Admins read all attempt answers" ON public.quiz_attempt_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'admin')
);

-- Roles: allow authenticated read
DROP POLICY IF EXISTS "Authenticated can read roles" ON public.roles;
CREATE POLICY "Authenticated can read roles" ON public.roles FOR SELECT TO authenticated USING (true);
