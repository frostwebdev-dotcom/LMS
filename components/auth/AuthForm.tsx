"use client";

import { useState } from "react";
import { useActionState } from "react";
import { signUp } from "@/app/actions/auth";

type Mode = "signin" | "signup";

interface AuthFormProps {
  mode: Mode;
  /** After login, redirect to this path (e.g. from ?redirect=). Only used when mode is signin. */
  redirectTo?: string;
  /** Error message from URL (signin route redirects with ?error=). */
  error?: string;
}

export function AuthForm({ mode, redirectTo, error: urlError }: AuthFormProps) {
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signInPending, setSignInPending] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      if (mode !== "signup") return null;
      const result = await signUp(formData);
      if (result.success && result.redirectTo) {
        window.location.href = result.redirectTo;
        return null;
      }
      return result.success ? null : result.error;
    },
    null as string | null
  );

  const errorMessage = mode === "signin" ? (signInError ?? urlError) : state;
  const pending = mode === "signin" ? signInPending : isPending;

  async function handleSignInSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (redirectTo) formData.set("redirect", redirectTo);
    setSignInError(null);
    setSignInPending(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; redirectTo?: string };
      if (res.ok && data.ok && data.redirectTo) {
        // Allow browser to persist Set-Cookie before navigating
        await new Promise((r) => setTimeout(r, 100));
        window.location.href = data.redirectTo;
        return;
      }
      setSignInError(data.error ?? "Sign in failed");
    } catch {
      setSignInError("Network error. Please try again.");
    } finally {
      setSignInPending(false);
    }
  }

  return (
    <form
      {...(mode === "signin"
        ? { onSubmit: handleSignInSubmit }
        : { action: formAction })}
      className="space-y-4"
    >
      {mode === "signin" && redirectTo && (
        <input type="hidden" name="redirect" value={redirectTo} />
      )}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </div>
      )}
      {mode === "signup" && (
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        {mode === "signup" && (
          <p className="mt-1 text-xs text-slate-500">At least 8 characters</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition"
      >
        {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
      </button>
    </form>
  );
}
