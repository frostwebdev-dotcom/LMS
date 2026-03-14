"use client";

import { useActionState } from "react";

type Result = { success: true; id?: string } | { success: false; error: string };

interface QuizFormAdminProps {
  action: (formData: FormData) => Promise<Result>;
}

export function QuizFormAdmin({ action }: QuizFormAdminProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: Result | null, fd: FormData) => action(fd),
    null as Result | null
  );

  return (
    <form action={formAction} className="space-y-4 max-w-md" aria-label="Create quiz">
      {state?.success === false && state?.error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="quiz-create-title" className="block text-sm font-medium text-slate-700 mb-1">
          Quiz title
        </label>
        <input
          id="quiz-create-title"
          name="title"
          type="text"
          required
          maxLength={200}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          aria-required="true"
        />
      </div>
      <div>
        <label htmlFor="quiz-create-description" className="block text-sm font-medium text-slate-700 mb-1">
          Description (optional)
        </label>
        <textarea
          id="quiz-create-description"
          name="description"
          rows={2}
          maxLength={1000}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="quiz-create-passing-score" className="block text-sm font-medium text-slate-700 mb-1">
          Passing score (%)
        </label>
        <input
          id="quiz-create-passing-score"
          name="passing_score_percent"
          type="number"
          min={0}
          max={100}
          defaultValue={80}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          aria-describedby="quiz-create-passing-hint"
        />
        <p id="quiz-create-passing-hint" className="mt-1 text-xs text-slate-500">
          Staff must score at least this to pass (0–100). Default 80.
        </p>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isPending ? "Creating…" : "Create quiz"}
      </button>
    </form>
  );
}
