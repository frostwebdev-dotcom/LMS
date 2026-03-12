# Training Portal – PostgreSQL Schema Reference

Production schema for the caregiver training portal. All tables use **UUID primary keys** and **timestamps** (`created_at`, `updated_at` where relevant). Relationships are normalized and support **staff** and **admin** roles, **module completion tracking**, and **quiz scoring/attempts**.

---

## Entity relationship overview

```
auth.users (Supabase)
       │
       ▼
  profiles ──────► roles
       │
       ├──► user_module_progress ──► training_modules
       ├──► user_lesson_progress ──► training_lessons ──► training_modules
       ├──► quiz_attempts ──► quizzes ──► training_modules
       │         │
       │         └──► quiz_attempt_answers ──► quiz_questions ──► quizzes
       │                        │
       │                        └──► quiz_answers ──► quiz_questions
       │
  training_modules ◄── training_lessons
       │
       └──► quizzes ──► quiz_questions ──► quiz_answers
```

---

## Table purposes

### 1. `roles`

**Purpose:** Defines application roles (e.g. `staff`, `admin`). Keeps role identity in one place so you can add roles or change names without altering `profiles`. Supports future permission flags or descriptions.

**Key columns:** `id` (UUID), `name` (unique), `description`, timestamps.

---

### 2. `profiles`

**Purpose:** Application-level user record linked to Supabase Auth. One row per `auth.users` row. Holds display info and **role** via `role_id` → `roles`. Used for RBAC in RLS and app logic.

**Key columns:** `id` (FK to `auth.users`), `email`, `full_name`, `role_id` (FK to `roles`), timestamps.

**Relationships:** Belongs to `auth.users`; belongs to `roles`.

---

### 3. `training_modules`

**Purpose:** Top-level training units (e.g. “Safety Basics”, “HIPAA”). Each module has a title, description, sort order, and publish flag. Staff see only published modules; admins manage all. Contains lessons and optionally a quiz.

**Key columns:** `id`, `title`, `description`, `sort_order`, `is_published`, `created_by` (FK to `auth.users`), timestamps.

**Relationships:** Has many `training_lessons` and `quizzes`; referenced by `user_module_progress`.

---

### 4. `training_lessons`

**Purpose:** Individual lessons inside a module (video, PDF, presentation, or text). One consumable item per row. `lesson_type` plus `storage_path` (for media) or `content_text` (for text) define the content. Completion is tracked per lesson in `user_lesson_progress`.

**Key columns:** `id`, `module_id` (FK), `title`, `lesson_type` (enum: video, pdf, presentation, text), `storage_path`, `content_text`, `sort_order`, timestamps. Constraint ensures media lessons have `storage_path`, text lessons have `content_text`.

**Relationships:** Belongs to `training_modules`; referenced by `user_lesson_progress`.

---

### 5. `quizzes`

**Purpose:** Quiz attached to a module. Holds title, description, and **passing score (percent)**. One module can have one or more quizzes. Questions and answers live in child tables.

**Key columns:** `id`, `module_id` (FK), `title`, `description`, `passing_score_percent`, timestamps.

**Relationships:** Belongs to `training_modules`; has many `quiz_questions`; referenced by `quiz_attempts`.

---

### 6. `quiz_questions`

**Purpose:** One row per question in a quiz. Order is by `sort_order`. Correct answer(s) are marked in `quiz_answers` with `is_correct = true`.

**Key columns:** `id`, `quiz_id` (FK), `question_text`, `sort_order`, timestamps.

**Relationships:** Belongs to `quizzes`; has many `quiz_answers`; referenced by `quiz_attempt_answers`.

---

### 7. `quiz_answers`

**Purpose:** Multiple-choice options for a question. Each row is one option; `is_correct` marks the right one(s). User’s chosen answer is stored in `quiz_attempt_answers` as `answer_id` → this table.

**Key columns:** `id`, `question_id` (FK), `answer_text`, `is_correct`, `sort_order`, timestamps.

**Relationships:** Belongs to `quiz_questions`; referenced by `quiz_attempt_answers`.

---

### 8. `user_module_progress`

**Purpose:** Tracks whether a user has completed a module. One row per user per module. `completed_at` is set when the user has done all required work (e.g. lessons + quiz). Used for “Completed” badges and reporting.

**Key columns:** `id`, `user_id` (FK to `auth.users`), `module_id` (FK), `completed_at` (nullable until completed), timestamps. Unique on `(user_id, module_id)`.

**Relationships:** Belongs to user and `training_modules`.

---

### 9. `user_lesson_progress` (recommended)

**Purpose:** Tracks completion of each lesson per user. Enables “complete all lessons” rules and per-lesson completion UI. One row per user per lesson; `completed_at` when the user finishes the lesson.

**Key columns:** `id`, `user_id`, `lesson_id` (FK to `training_lessons`), `completed_at`, timestamps. Unique on `(user_id, lesson_id)`.

**Relationships:** Belongs to user and `training_lessons`.

---

### 10. `quiz_attempts`

**Purpose:** One row per quiz submission. Stores **score (percent)** and **passed** (boolean). Used for “best attempt” display and compliance (e.g. must pass at least once).

**Key columns:** `id`, `user_id`, `quiz_id`, `score_percent`, `passed`, `completed_at`, `created_at`.

**Relationships:** Belongs to user and `quizzes`; has many `quiz_attempt_answers`.

---

### 11. `quiz_attempt_answers`

**Purpose:** Records which answer the user selected for each question in an attempt. One row per question per attempt. Enables review (“what did I pick?”) and analytics.

**Key columns:** `id`, `attempt_id` (FK), `question_id` (FK), `answer_id` (FK to `quiz_answers`, nullable if answer is deleted), `created_at`. Unique on `(attempt_id, question_id)`.

**Relationships:** Belongs to `quiz_attempts`, `quiz_questions`, and `quiz_answers`.

---

## Role-based access (RLS)

- **Staff:** Can read published modules, their lessons, and quizzes; can read/insert/update only their own progress and quiz attempts.
- **Admin:** Can read/update all profiles (for role assignment), manage modules/lessons/quizzes/questions/answers, and read all progress and quiz attempts.

Policies use a join to `profiles` and `roles` so that “admin” is determined by `roles.name = 'admin'` for the current user’s `role_id`.

---

## Migration

- **File:** `supabase/migrations/20250312000001_full_training_portal_schema.sql`
- **Run:** Supabase Dashboard → SQL Editor, or `supabase db push` with Supabase CLI.
- **Note:** If you already have the older schema (`profiles.role` as enum, `module_content`, `quiz_options`, `module_progress`), either run this on a fresh database or add a separate migration that renames/drops old tables and creates these. This file is written as a **standalone full schema** for a new project.
