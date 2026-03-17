import { AUTH_RESET_PASSWORD_PATH } from "@/lib/auth/config";

/**
 * Builds the full URL for the reset-password page. Used as redirectTo in
 * resetPasswordForEmail so the recovery email links to our app.
 * Set NEXT_PUBLIC_APP_URL in production (e.g. https://yourdomain.com).
 */
export function getResetPasswordRedirectUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = base.replace(/\/$/, "");
  return `${url}${AUTH_RESET_PASSWORD_PATH}`;
}
