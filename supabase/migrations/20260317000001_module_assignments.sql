-- =============================================================================
-- Training assignment by employee and by role.
-- Staff see only modules assigned to them (module_user_assignments) or to
-- their role (module_role_assignments). Admin can manage assignments and see all.
-- =============================================================================

-- Assignment tables
CREATE TABLE IF NOT EXISTS public.module_user_assignments (
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (module_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.module_role_assignments (
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (module_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_module_user_assignments_user ON public.module_user_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_module_role_assignments_role ON public.module_role_assignments(role_id);

COMMENT ON TABLE public.module_user_assignments IS 'Modules assigned to specific employees.';
COMMENT ON TABLE public.module_role_assignments IS 'Modules assigned to roles (all users with that role see the module).';

-- RLS: only admin can read/write assignment tables
ALTER TABLE public.module_user_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_role_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage module user assignments" ON public.module_user_assignments;
CREATE POLICY "Admins manage module user assignments"
  ON public.module_user_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins manage module role assignments" ON public.module_role_assignments;
CREATE POLICY "Admins manage module role assignments"
  ON public.module_role_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Helper: staff can see a module if it is published AND (assigned to user OR assigned to user's role)
-- We use this in training_modules, training_lessons, and quizzes policies.

DROP POLICY IF EXISTS "Staff read published modules" ON public.training_modules;
DROP POLICY IF EXISTS "Staff can read published modules" ON public.training_modules;
CREATE POLICY "Staff read assigned modules"
  ON public.training_modules FOR SELECT
  USING (
    (
      is_published = true
      AND (
        EXISTS (
          SELECT 1 FROM public.module_user_assignments mua
          WHERE mua.module_id = training_modules.id AND mua.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.module_role_assignments mra ON mra.module_id = training_modules.id AND mra.role_id = p.role_id
          WHERE p.id = auth.uid()
        )
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Training lessons: staff see if the module is visible (assigned + published) or admin
DROP POLICY IF EXISTS "Staff read lessons of published modules" ON public.training_lessons;
CREATE POLICY "Staff read lessons of assigned modules"
  ON public.training_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_modules m
      WHERE m.id = training_lessons.module_id
      AND (
        (
          m.is_published = true
          AND (
            EXISTS (SELECT 1 FROM public.module_user_assignments mua WHERE mua.module_id = m.id AND mua.user_id = auth.uid())
            OR EXISTS (
              SELECT 1 FROM public.profiles p
              JOIN public.module_role_assignments mra ON mra.module_id = m.id AND mra.role_id = p.role_id
              WHERE p.id = auth.uid()
            )
          )
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.id = auth.uid() AND r.name = 'admin'
        )
      )
    )
  );

-- Quizzes: same visibility as modules
DROP POLICY IF EXISTS "Staff read quizzes of published modules" ON public.quizzes;
CREATE POLICY "Staff read quizzes of assigned modules"
  ON public.quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_modules m
      WHERE m.id = quizzes.module_id
      AND (
        (
          m.is_published = true
          AND (
            EXISTS (SELECT 1 FROM public.module_user_assignments mua WHERE mua.module_id = m.id AND mua.user_id = auth.uid())
            OR EXISTS (
              SELECT 1 FROM public.profiles p
              JOIN public.module_role_assignments mra ON mra.module_id = m.id AND mra.role_id = p.role_id
              WHERE p.id = auth.uid()
            )
          )
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.id = auth.uid() AND r.name = 'admin'
        )
      )
    )
  );

-- Quiz questions: staff see when quiz's module is visible (assigned + published) or admin
DROP POLICY IF EXISTS "Staff read questions of visible quizzes" ON public.quiz_questions;
CREATE POLICY "Staff read questions of assigned module quizzes"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      JOIN public.training_modules m ON m.id = q.module_id
      WHERE q.id = quiz_questions.quiz_id
      AND (
        (
          m.is_published = true
          AND (
            EXISTS (SELECT 1 FROM public.module_user_assignments mua WHERE mua.module_id = m.id AND mua.user_id = auth.uid())
            OR EXISTS (
              SELECT 1 FROM public.profiles p
              JOIN public.module_role_assignments mra ON mra.module_id = m.id AND mra.role_id = p.role_id
              WHERE p.id = auth.uid()
            )
          )
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.id = auth.uid() AND r.name = 'admin'
        )
      )
    )
  );

-- Quiz answers: same as questions
DROP POLICY IF EXISTS "Staff read answers of visible questions" ON public.quiz_answers;
CREATE POLICY "Staff read answers of assigned module questions"
  ON public.quiz_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      JOIN public.training_modules m ON m.id = q.module_id
      WHERE qq.id = quiz_answers.question_id
      AND (
        (
          m.is_published = true
          AND (
            EXISTS (SELECT 1 FROM public.module_user_assignments mua WHERE mua.module_id = m.id AND mua.user_id = auth.uid())
            OR EXISTS (
              SELECT 1 FROM public.profiles p
              JOIN public.module_role_assignments mra ON mra.module_id = m.id AND mra.role_id = p.role_id
              WHERE p.id = auth.uid()
            )
          )
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.roles r ON r.id = p.role_id
          WHERE p.id = auth.uid() AND r.name = 'admin'
        )
      )
    )
  );

-- Backfill: assign all currently published modules to the staff role so existing
-- staff keep seeing them until admin changes assignments.
INSERT INTO public.module_role_assignments (module_id, role_id)
  SELECT m.id, r.id
  FROM public.training_modules m
  CROSS JOIN public.roles r
  WHERE r.name = 'staff'
    AND m.is_published = true
ON CONFLICT (module_id, role_id) DO NOTHING;
