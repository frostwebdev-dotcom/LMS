"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/password";
import type { RequestPasswordResetResult } from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import { AUTH_LOGIN_PATH } from "@/lib/auth/config";
import { forgotPasswordSchema } from "@/lib/validations/password";

export function ForgotPasswordForm() {
  const [result, setResult] = useState<RequestPasswordResetResult | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    setResult(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setEmailError(parsed.error.errors[0]?.message ?? "Please enter a valid email address");
      return;
    }
    setEmailError(null);
    setIsPending(true);
    try {
      const res = await requestPasswordReset(formData);
      setResult(res);
    } finally {
      setIsPending(false);
    }
  }

  if (result?.success === true) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          If an account exists for that email address, you will receive instructions to reset your password. Please check your inbox and spam folder.
        </div>
        <p className="text-sm text-primary-700">
          <Link href={AUTH_LOGIN_PATH} className="font-medium text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.success === false && result.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {result.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary-800 mb-1">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "email-error" : undefined}
          className="w-full rounded-lg border border-primary-200 px-3 py-2 text-primary-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 aria-[invalid=true]:border-red-500"
          placeholder="you@example.com"
          disabled={isPending}
        />
        {emailError && (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            {emailError}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Sending…" : "Send reset instructions"}
      </Button>
      <p className="text-center text-sm text-primary-700">
        <Link href={AUTH_LOGIN_PATH} className="font-medium text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
