# Row Level Security (RLS) – Policy Reference

Production RLS for the caregiver training portal. All tables have RLS **enabled**; every row access is restricted by the policies below.

---

## Security model

| Role  | Training content (modules, lessons, quizzes)     | Own progress & attempts        | Other users’ data      |
|-------|--------------------------------------------------|--------------------------------|------------------------|
| **Staff** | Read only **published** modules and their lessons/quizzes | Read, insert, update own only | No access              |
| **Admin** | Read and manage **all** (CRUD)                   | Read all progress/attempts     | Read all profiles; update any profile (e.g. role) |

Admin is determined by `profiles.role_id` → `roles.name = 'admin'`. Policies use a subquery like:

```sql
EXISTS (
  SELECT 1 FROM public.profiles p
  JOIN public.roles r ON r.id = p.role_id
  WHERE p.id = auth.uid() AND r.name = 'admin'
)
```

---

## Enable RLS

Every application table has RLS turned on. If a table has RLS enabled but **no** policy for a given command (SELECT/INSERT/UPDATE/DELETE), that command is **denied** for all users. So we define at least one policy per allowed operation.

---

## Policies by table

### `roles`

| Policy                     | Command | Who        | Purpose |
|----------------------------|---------|------------|--------|
| Authenticated can read roles | SELECT  | authenticated | So the app can show role labels and policies can check admin. No INSERT/UPDATE/DELETE from the app. |

---

### `profiles`

| Policy                     | Command | Who   | Purpose |
|----------------------------|---------|-------|--------|
| Users can read own profile | SELECT  | self  | Staff see only their own row (email, full_name, role). |
| Users can update own profile | UPDATE | self  | Staff can change their own non-role fields (e.g. full_name). `WITH CHECK` ensures they cannot change `id` or `role_id` to another user’s. |
| Admins can read all profiles | SELECT | admin | For user list and progress reporting. |
| Admins can update all profiles | UPDATE | admin | So admins can assign roles (e.g. set `role_id` to admin). |

No INSERT/DELETE: rows are created by the `handle_new_user` trigger on signup; deletion is handled by auth.

---

### `training_modules`

| Policy                       | Command | Who    | Purpose |
|------------------------------|---------|--------|--------|
| Staff read published modules | SELECT  | staff + admin | Staff see rows where `is_published = true`; admin see all. Draft modules are hidden from staff. |
| Admins can manage modules    | ALL     | admin  | Full CRUD: create, edit, publish/unpublish, delete modules. |

Staff have **no** INSERT/UPDATE/DELETE on modules.

---

### `training_lessons`

| Policy                             | Command | Who    | Purpose |
|------------------------------------|---------|--------|--------|
| Staff read lessons of published modules | SELECT | staff + admin | Staff see a lesson only if its **module** is published (or viewer is admin). |
| Admins can manage lessons          | ALL     | admin  | Create, edit, reorder, delete lessons. |

Staff cannot create or change lessons; they only view content of published modules.

---

### `quizzes`

| Policy                               | Command | Who    | Purpose |
|--------------------------------------|---------|--------|--------|
| Staff read quizzes of published modules | SELECT | staff + admin | Staff see quizzes whose module is published (or viewer is admin). |
| Admins can manage quizzes            | ALL     | admin  | Full CRUD on quizzes. |

---

### `quiz_questions`

| Policy                                | Command | Who    | Purpose |
|---------------------------------------|---------|--------|--------|
| Staff read questions of visible quizzes | SELECT | staff + admin | Staff see questions only when the quiz’s module is published (or viewer is admin). |
| Admins can manage quiz questions      | ALL     | admin  | Add, edit, reorder, delete questions. |

---

### `quiz_answers`

| Policy                                | Command | Who    | Purpose |
|---------------------------------------|---------|--------|--------|
| Staff read answers of visible questions | SELECT | staff + admin | Staff see answer options only when the question’s quiz/module is visible. |
| Admins can manage quiz answers        | ALL     | admin  | Add, edit, mark correct, delete options. |

---

### `user_module_progress`

| Policy                     | Command | Who   | Purpose |
|----------------------------|---------|-------|--------|
| Users read own module progress | SELECT | self  | Staff see only their own completion rows. |
| Users insert own module progress | INSERT | self  | Staff can create a progress row only for themselves (`user_id = auth.uid()`). |
| Users update own module progress | UPDATE | self  | Staff can set `completed_at` only on their own row. |
| Admins read all module progress | SELECT | admin | For dashboards and compliance (who completed which module). |

Staff have **no** DELETE (progress is kept). Admins have **no** INSERT/UPDATE/DELETE on this table (read-only for reporting).

---

### `user_lesson_progress`

| Policy                     | Command | Who   | Purpose |
|----------------------------|---------|-------|--------|
| Users read own lesson progress | SELECT | self  | Staff see only their own lesson completion. |
| Users insert own lesson progress | INSERT | self  | Staff create progress only for themselves. |
| Users update own lesson progress | UPDATE | self  | Staff update only their own row (e.g. set `completed_at`). |
| Admins read all lesson progress | SELECT | admin | For reporting. |

Same idea as module progress: staff own their data; admin read-only.

---

### `quiz_attempts`

| Policy                     | Command | Who   | Purpose |
|----------------------------|---------|-------|--------|
| Users read own quiz attempts | SELECT | self  | Staff see only their own attempts (scores, pass/fail). |
| Users insert own quiz attempts | INSERT | self  | Staff can submit a quiz only as themselves. |
| Admins read all quiz attempts | SELECT | admin | For reporting and compliance. |

No UPDATE/DELETE: attempts are immutable once submitted.

---

### `quiz_attempt_answers`

| Policy                     | Command | Who   | Purpose |
|----------------------------|---------|-------|--------|
| Users read own attempt answers | SELECT | self  | Staff see selected answers only for their own attempts (via `attempt_id` → `quiz_attempts.user_id`). |
| Users insert own attempt answers | INSERT | self  | Staff can insert answer rows only for an attempt they own. |
| Admins read all attempt answers | SELECT | admin | For review and analytics. |

No UPDATE/DELETE: answers are fixed when the attempt is submitted.

---

## Summary

- **Staff:** View published content only; view and update **only their own** progress and quiz attempts.
- **Admin:** View and manage all training content and user profiles; view all progress and quiz attempts (no write to progress/attempts).
- **RLS is enabled** on all listed tables; the migration `20250313000001_rls_policies.sql` applies these policies in production-ready form.
