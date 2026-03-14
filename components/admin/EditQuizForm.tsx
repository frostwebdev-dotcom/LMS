"use client";

import { useActionState } from "react";

export type QuizAdminResult = { success: true; id?: string } | { success: false; error: string };

interface EditQuizFormProps {
  quizId: string;
  moduleId: string;
  initialTitle: string;
  initialDescription: string | null;
  initialPassingScorePercent: number;
  action: (
    quizId: string,
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<QuizAdminResult>;
}

export function EditQuizForm({
  quizId,
  moduleId,
  initialTitle,
  initialDescription,
  initialPassingScorePercent,
  action,
}: EditQuizFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: QuizAdminResult | null, fd: FormData) => action(quizId, moduleId, _prev, fd),
    null as QuizAdminResult | null
  );

  return (
    <form action={formAction} className="space-y-4 max-w-md" aria-labelledby="quiz-settings-heading">
      <h2 id="quiz-settings-heading" className="text-lg font-semibold text-slate-800">
        Quiz settings
      </h2>
      {state?.success === false && state?.error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="quiz-title" className="block text-sm font-medium text-slate-700 mb-1">
          Quiz title
        </label>
        <input
          id="quiz-title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={initialTitle}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          aria-required="true"
        />
      </div>
      <div>
        <label htmlFor="quiz-description" className="block text-sm font-medium text-slate-700 mb-1">
          Description (optional)
        </label>
        <textarea
          id="quiz-description"
          name="description"
          rows={2}
          maxLength={1000}
          defaultValue={initialDescription ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label
          htmlFor="quiz-passing-score"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Passing score (%)
        </label>
        <input
          id="quiz-passing-score"
          name="passing_score_percent"
          type="number"
          min={0}
          max={100}
          defaultValue={initialPassingScorePercent}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          aria-describedby="passing-score-hint"
        />
        <p id="passing-score-hint" className="mt-1 text-xs text-slate-500">
          Staff must score at least this percentage to pass (0–100).
        </p>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save quiz settings"}
      </button>
    </form>
  );
}
