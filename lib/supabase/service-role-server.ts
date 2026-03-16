import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with service role. Use only in server actions
 * or API routes for admin operations (e.g. create user, delete user).
 * Never expose this client or SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createClientServiceRole() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
