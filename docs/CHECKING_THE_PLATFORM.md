# Checking Whether the Platform Is Working

Use this checklist to verify the caregiver training portal locally and with Supabase.

---

## 1. Prerequisites

- **Node.js** (v18+)
- **Supabase project** with:
  - Migrations applied (see [README](../README.md))
  - Auth **Email** provider enabled (no extra config needed for email/password)
  - Storage bucket `training-content` if you use file uploads

---

## 2. Environment

From the project root:

```bash
# Copy env example if you don't have .env.local yet
copy .env.local.example .env.local   # Windows
# cp .env.local.example .env.local   # macOS/Linux

# Edit .env.local and set:
#   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

In Supabase: **Project Settings → API** for URL and anon key.

---

## 3. Install and Run

```bash
npm install --legacy-peer-deps
```

(Next 15.0.3 and React 19 can trigger peer dependency warnings; `--legacy-peer-deps` avoids that. If you get "Cannot find module 'react'" after a normal `npm install`, run a clean install: delete `node_modules` and `package-lock.json`, then run `npm install --legacy-peer-deps` again.)

```bash
npm run dev
```

Open **http://localhost:3000**. You should see the home page with a “Sign in” link.

---

## 4. Quick Checks

| Step | What to do | Expected |
|------|------------|----------|
| **Home** | Open http://localhost:3000 | “Harmony Hearts Homecare” and “Sign in” link. |
| **Login page** | Click “Sign in” | Login form (email, password). |
| **Protected route** | Open http://localhost:3000/dashboard (logged out) | Redirect to `/login?redirect=/dashboard`. |
| **Sign up** | Go to /signup, enter email + password (8+ chars), submit | Redirect to `/dashboard` (or error if Supabase not configured). |
| **Sign in** | Go to /login, sign in with same user | Redirect to `/dashboard`. |
| **Dashboard** | On /dashboard while logged in | “Training modules” and header with your email and “Sign out”. |
| **Sign out** | Click “Sign out” | Redirect to `/login`. |
| **Admin** | In Supabase: set `profiles.role_id` to admin role for your user, sign in again | “Admin” link in header; /admin loads. |
| **Build** | `npm run build` | Build completes without errors. |

---

## 5. If Something Fails

- **“Missing NEXT_PUBLIC_SUPABASE_URL or…”**  
  Add or fix `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` and restart `npm run dev`.

- **Sign up / sign in errors**  
  In Supabase: **Authentication → Providers**: ensure **Email** is enabled.  
  If you use email confirmation, turn it off for local testing or use the link from the inbox.

- **Redirect loop or 404**  
  Clear cookies for localhost and try again. Ensure middleware and auth config paths match your routes.

- **“Unauthorized” or no profile**  
  Run migrations so `profiles` (and `roles`) exist. Check **Table Editor → profiles** for a row with your `auth.users` id after signup.

- **Build errors**  
  Run `npm run lint` and fix any reported issues.

---

## 6. One-Liner Sanity Check

From the project root:

```bash
npm run build
```

If the build succeeds, the app compiles and is ready for further testing (auth, modules, quizzes, admin).
