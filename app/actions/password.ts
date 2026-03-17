"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/get-session";
import { changePasswordSchema } from "@/lib/validations/password";

export type ChangePasswordResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Changes the authenticated user's password after verifying the current password.
 * Uses signInWithPassword to verify current password, then updateUser for the new one.
 */
export async function changePassword(
  formData: FormData
): Promise<ChangePasswordResult> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword") ?? "",
    newPassword: formData.get("newPassword") ?? "",
    confirmNewPassword: formData.get("confirmNewPassword") ?? "",
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { success: false, error: first?.message ?? "Validation failed" };
  }

  const user = await getSessionUser();
  if (!user?.email) {
    return { success: false, error: "You must be signed in to change your password." };
  }

  const supabase = await createClient();
  const { currentPassword, newPassword } = parsed.data;

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, error: "Current password is incorrect." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return {
      success: false,
      error: updateError.message ?? "Failed to update password. Please try again.",
    };
  }

  return { success: true };
}

export type RequestPasswordResetResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Sends a password reset email via Supabase. Always returns success with the same
 * message to avoid leaking whether the email exists.
 * Uses NEXT_PUBLIC_APP_URL (or localhost) for the recovery link redirect.
 */
export async function requestPasswordReset(
  formData: FormData
): Promise<RequestPasswordResetResult> {
  const email = String(formData.get("email") ?? "").trim();
  const { forgotPasswordSchema } = await import("@/lib/validations/password");
  const parsed = forgotPasswordSchema.safeParse({ email });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { success: false, error: first?.message ?? "Invalid email" };
  }

  const supabase = await createClient();
  const { getResetPasswordRedirectUrl } = await import("@/lib/auth/password");
  const redirectTo = getResetPasswordRedirectUrl();

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo,
  });

  return {
    success: true,
  };
}
