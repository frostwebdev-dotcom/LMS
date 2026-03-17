import { z } from "zod";

/** Minimum length for new passwords. */
const MIN_PASSWORD_LENGTH = 8;

/** Maximum length to avoid DoS and align with common hashing limits. */
const MAX_PASSWORD_LENGTH = 128;

/**
 * Reasonable password strength: at least 8 characters, max 128.
 * Can be extended with .regex() for complexity (e.g. uppercase, number, symbol).
 */
const passwordStrength = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(MAX_PASSWORD_LENGTH, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordStrength,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmNewPassword"],
  });

export const resetPasswordSchema = z
  .object({
    newPassword: passwordStrength,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email address is too long"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH };
