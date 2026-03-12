# Harmony Hearts Homecare – Training Portal

Internal caregiver training LMS for staff and admins. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

## Features

- **Staff**: Sign in, view published training modules, watch videos, open PDFs/presentations, take quizzes, track completion.
- **Admin**: Manage modules (create, edit, publish, delete), upload content to Supabase Storage, create quizzes and questions, view staff progress.

## Tech stack

- Next.js 15 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage)
- Zod for validation

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```
   If you see a peer dependency conflict (React 19 vs Next 15), run:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - Run the SQL in `supabase/migrations/20250311000001_initial_schema.sql` in the SQL Editor.
   - In Storage, create a **private** bucket named `training-content`.
   - Copy `.env.local.example` to `.env.local` and set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Sign up; the first user can be set to `admin` in the database (`profiles.role`) if needed.

## Project structure

- `app/` – Routes, layouts, server components, actions
- `components/` – Reusable UI (auth, content viewer, quiz, admin forms)
- `lib/` – Supabase client (browser/server/middleware), auth helpers, Zod schemas
- `services/` – Module, content, quiz, progress, admin progress (DB access and logic)
- `types/` – Shared TypeScript and DB types
- `supabase/migrations/` – SQL schema and RLS

## Roles

- **staff** – Can access `/dashboard`, view published modules, complete content and quizzes.
- **admin** – Can access `/admin`, manage modules/content/quizzes, view staff progress. Admins also see “Admin” in the dashboard header.

## Security

- Auth and route protection via middleware and server-side `getSessionUser` / `requireAdmin`.
- RLS policies on all tables restrict access by role and ownership.
