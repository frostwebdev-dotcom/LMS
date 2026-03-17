"use client";

import { useState } from "react";
import { changePassword } from "@/app/actions/password";
import type { ChangePasswordResult } from "@/app/actions/password";
import { PasswordField } from "@/components/ui/password-field";
import { Button } from "@/components/ui/button";
import { changePasswordSchema, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/validations/password";

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

function getFieldErrors(formData: FormData): FieldErrors {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword") ?? "",
    newPassword: formData.get("newPassword") ?? "",
    confirmNewPassword: formData.get("confirmNewPassword") ?? "",
  });
  if (parsed.success) return {};
  const map: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const path = issue.path[0] as keyof FieldErrors;
    if (path && !map[path]) map[path] = issue.message;
  }
  return map;
}

export function ChangePasswordForm() {
  const [result, setResult] = useState<ChangePasswordResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setResult(null);
    const errors = getFieldErrors(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setIsPending(true);
    try {
      const res = await changePassword(formData);
      setResult(res);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {result?.success === true && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          Your password has been updated.
        </div>
      )}
      {result?.success === false && result.error && !fieldErrors.currentPassword && !fieldErrors.newPassword && !fieldErrors.confirmNewPassword && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {result.error}
        </div>
      )}

      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label="Current password"
        autoComplete="current-password"
        required
        error={fieldErrors.currentPassword}
        disabled={isPending}
      />
      <PasswordField
        id="newPassword"
        name="newPassword"
        label="New password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        error={fieldErrors.newPassword}
        disabled={isPending}
      />
      <p className="text-xs text-primary-600 -mt-2">At least {MIN_PASSWORD_LENGTH} characters.</p>
      <PasswordField
        id="confirmNewPassword"
        name="confirmNewPassword"
        label="Confirm new password"
        autoComplete="new-password"
        required
        maxLength={MAX_PASSWORD_LENGTH}
        error={fieldErrors.confirmNewPassword}
        disabled={isPending}
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
