"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "@/components/ui/password-field";
import { Button } from "@/components/ui/button";
import { resetPasswordSchema, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/validations/password";
import { AUTH_LOGIN_PATH, AUTH_FORGOT_PASSWORD_PATH } from "@/lib/auth/config";

type FieldErrors = { newPassword?: string; confirmNewPassword?: string };

function getFieldErrors(formData: FormData): FieldErrors {
  const parsed = resetPasswordSchema.safeParse({
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

export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "expired" | "success">("loading");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (!hash) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (mounted) setStatus(user ? "ready" : "expired");
      });
      return () => {
        mounted = false;
      };
    }
    const params = new URLSearchParams(hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");
    if (type !== "recovery" || !access_token || !refresh_token) {
      if (mounted) setStatus("expired");
      return;
    }
    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (!mounted) return;
        if (error) {
          setStatus("expired");
          return;
        }
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        setStatus("ready");
      })
      .catch(() => {
        if (mounted) setStatus("expired");
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setSubmitError(null);
    const errors = getFieldErrors(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setIsPending(true);
    try {
      const supabase = createClient();
      const newPassword = String(formData.get("newPassword") ?? "");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setSubmitError(error.message ?? "Failed to update password.");
        return;
      }
      await supabase.auth.signOut();
      setStatus("success");
      router.push(`${AUTH_LOGIN_PATH}?success=password-reset`);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (status === "loading") {
    return (
      <p className="text-primary-700 text-sm" role="status" aria-live="polite">
        Checking your reset link…
      </p>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          Your password has been updated. Redirecting to sign in…
        </div>
        <p className="text-sm text-primary-700">
          <Link href={AUTH_LOGIN_PATH} className="font-medium text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded">
            Go to sign in
          </Link>
        </p>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
          This link is invalid or has expired. Please request a new password reset.
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href={AUTH_FORGOT_PASSWORD_PATH}
            className="inline-block rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-center"
          >
            Request a new reset link
          </Link>
          <Link
            href={AUTH_LOGIN_PATH}
            className="inline-block text-center text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {submitError}
        </div>
      )}
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
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Updating…" : "Set new password"}
      </Button>
    </form>
  );
}
