# Project Architecture

Production-ready caregiver training portal: Next.js App Router, TypeScript, Tailwind CSS, Supabase.

---

## Folder structure

```
LMS-Tommy/
├── app/                    # Routes and server entry points
│   ├── (auth)/             # Optional: group login/signup
│   ├── login/
│   ├── signup/
│   ├── dashboard/          # Staff area (modules, content, quizzes)
│   ├── modules/            # Optional top-level modules entry
│   ├── quizzes/            # Quizzes entry (e.g. redirect or list)
│   ├── admin/              # Admin-only area (RBAC)
│   ├── actions/            # Server actions (auth, modules, content, quiz)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/             # React components
│   ├── ui/                 # Shared primitives (Button, Card, Input)
│   ├── layout/             # Layout pieces (Header, PageLayout)
│   ├── auth/               # Login/signup forms
│   ├── content/            # Content viewer, etc.
│   ├── quiz/               # Quiz form, question UI
│   └── admin/              # Admin-only components
├── lib/                    # Core utilities and config
│   ├── supabase/           # Supabase client (browser, server, middleware)
│   ├── auth/               # Server auth helpers (getSessionUser, requireAdmin)
│   └── validations/        # Zod schemas (auth, modules, content, quiz)
├── services/               # Business logic and data access
│   ├── module-service.ts
│   ├── content-service.ts
│   ├── quiz-service.ts
│   ├── progress-service.ts
│   └── admin-progress-service.ts
├── hooks/                  # Client-side React hooks
│   ├── use-auth.ts
│   ├── use-role.ts
│   └── index.ts
├── types/                  # TypeScript types
│   ├── database.ts         # DB entity types
│   ├── auth.ts             # Session / user types
│   └── index.ts
├── validations/            # Single entry for all validation schemas
│   └── index.ts            # Re-exports from lib/validations
├── supabase/               # Supabase config and migrations
│   └── migrations/
└── public/
```

---

## Why each folder exists

### `app/` — Routes and server entry points

- **Purpose:** Next.js App Router: every folder defines routes and layouts. Server Components and Server Actions live here.
- **Why:** Keeps URL structure and server entry points in one place. Layouts wrap segments (e.g. dashboard layout for all `/dashboard/*`). Middleware protects routes; auth checks run in layouts or pages.
- **Role-based access:** Use `getSessionUser()` / `requireAdmin()` in layout or page; redirect or 403 when unauthorized.

### `components/` — React components

- **Purpose:** Reusable UI and feature-specific components. Split by role and domain.
- **`ui/`** — Shared primitives (Button, Card, Input). No business logic; used everywhere for consistent styling and behavior.
- **`layout/`** — Shared layout pieces (Header, PageLayout). Used by dashboard and admin layouts.
- **`auth/`** — Login/signup forms and any auth-specific UI.
- **`content/`** — Content viewer (video, PDF, etc.) and related UI.
- **`quiz/`** — Quiz form, questions, options.
- **`admin/`** — Admin-only forms and lists (modules, content, quizzes, progress).

### `lib/` — Core utilities and config

- **Purpose:** Framework and app wiring: Supabase clients, auth helpers, validation schemas. No business logic; used by app, components, and services.
- **`supabase/`** — Browser client, server client, and middleware session handling. Single place for Supabase configuration.
- **`auth/`** — Server-side helpers: `getSessionUser()`, `requireSessionUser()`, `requireAdmin()`. Used in layouts and Server Actions for protection.
- **`validations/`** — Zod schemas for forms and API/server actions. Single source of truth for input shape and validation.

### `services/` — Business logic and data access

- **Purpose:** All database access and domain logic. No React, no route knowledge. Called from Server Actions or server components.
- **Why:** Keeps UI and routes thin; testable and reusable. RLS still enforces security; services assume an authenticated Supabase client.

### `hooks/` — Client-side React hooks

- **Purpose:** Client-only state and side effects (e.g. auth state, role for UI). Complements server-side auth.
- **Why:** Server handles “can they see this?”; hooks handle “show/hide UI” and client behavior. Use server auth for protection, hooks for UX.

### `types/` — TypeScript types

- **Purpose:** Shared types for database entities, auth, and API boundaries. No runtime code.
- **Why:** Consistent types across app, services, and validations; better refactors and editor support.

### `validations/` — Validation entry point

- **Purpose:** One place to import all Zod schemas (e.g. `from "@/validations"`). Implementations live in `lib/validations/`.
- **Why:** Clear “where do I get schemas?” and room to add shared validation helpers later.

### `supabase/` — Supabase integration

- **Purpose:** Migrations and config for PostgreSQL and Storage. Schema and RLS live here.
- **Why:** Version-controlled schema; same migrations for all environments. Supabase client code stays in `lib/supabase/`.

---

## Route map (high level)

| Route            | Purpose                    | Access   |
|------------------|----------------------------|----------|
| `/`              | Landing / home             | Public   |
| `/login`         | Sign in                    | Public   |
| `/signup`        | Sign up                    | Public   |
| `/dashboard`     | Staff home (module list)   | Staff    |
| `/dashboard/modules/[id]` | Module detail, content, quiz | Staff |
| `/quizzes`       | Quizzes entry (e.g. redirect) | Staff  |
| `/admin`         | Admin home                 | Admin    |
| `/admin/modules` | Manage modules             | Admin    |
| `/admin/progress`| Staff progress             | Admin    |

---

## Role-based access

- **Middleware:** Redirects unauthenticated users from `/dashboard` and `/admin` to `/login`.
- **Layouts/pages:** Call `getSessionUser()` or `requireAdmin()`; redirect or return 403 when the user is missing or not allowed.
- **RLS:** Supabase policies restrict rows by role and ownership. Services use the authenticated client from `createClient()` (server) so RLS applies to every query.

This keeps the app ready for production: clear separation of routes, components, lib, services, hooks, types, validations, and Supabase.
