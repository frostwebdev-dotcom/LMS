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
    <form action={formAction} className="space-y-4 max-w-md">
      {state?.success === false && state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          Quiz title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="passing_score_percent" className="block text-sm font-medium text-slate-700 mb-1">
          Passing score (%)
        </label>
        <input
          id="passing_score_percent"
          name="passing_score_percent"
          type="number"
          min={0}
          max={100}
          defaultValue={80}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
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
