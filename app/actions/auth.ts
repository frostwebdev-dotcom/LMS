"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/get-session";
import { resolveRoleRedirect } from "@/lib/auth/guards";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";
import {
  AUTH_LOGIN_PATH,
  STAFF_DEFAULT_PATH,
} from "@/lib/auth/config";

export type AuthActionResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

const NETWORK_ERROR_MESSAGE =
  "Cannot reach the server. Check your internet connection and try again.";

function toUserFriendlyError(message: string): string {
  if (/fetch failed|timeout|ECONNREFUSED|ENOTFOUND|connect/i.test(message)) {
    return NETWORK_ERROR_MESSAGE;
  }
  return message;
}

/**
 * Sign in with email and password. Redirects to ?redirect= if valid, else dashboard.
 */
export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  let error: { message: string } | null = null;
  try {
    const result = await supabase.auth.signInWithPassword(parsed.data);
    error = result.error;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: toUserFriendlyError(message) };
  }
  if (error) {
    return { success: false, error: toUserFriendlyError(error.message) };
  }

  const user = await getSessionUser();
  const path = resolveRoleRedirect(user?.role ?? "staff", formData.get("redirect")?.toString());
  // Return redirect path so client can navigate after cookies are set on this response.
  // Redirecting here can prevent Set-Cookie from reaching the browser on some setups.
  return { success: true, redirectTo: path };
}

/**
 * Sign up with email, password, optional full name and role (for invite flows).
 * Redirects to dashboard after success.
 */
export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    fullName: formData.get("fullName") ?? undefined,
    role: formData.get("role") === "admin" ? "admin" : "staff",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  let error: { message: string } | null = null;
  try {
    const result = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
          role: parsed.data.role ?? "staff",
        },
      },
    });
    error = result.error;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: toUserFriendlyError(message) };
  }
  if (error) {
    return { success: false, error: toUserFriendlyError(error.message) };
  }

  return { success: true, redirectTo: STAFF_DEFAULT_PATH };
}

/**
 * Sign out and clear session. Uses server client so cookies are cleared in the response.
 * Call from form action: <form action={signOut}>.
 */
export async function signOut(_formData?: FormData): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(AUTH_LOGIN_PATH);
}
