"use client";

import { useActionState } from "react";

type Result = { success: true } | { success: false; error: string };

interface AddOptionFormProps {
  questionId: string;
  quizId: string;
  moduleId: string;
  action: (
    questionId: string,
    quizId: string,
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<Result>;
}

export function AddOptionForm({
  questionId,
  quizId,
  moduleId,
  action,
}: AddOptionFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: Result | null, fd: FormData) =>
      action(questionId, quizId, moduleId, _prev, fd),
    null as Result | null
  );

  return (
    <form action={formAction} className="mt-2 flex flex-wrap items-center gap-2">
      {state?.success === false && state?.error && (
        <span className="text-sm text-red-600">{state.error}</span>
      )}
      <input
        name="option_text"
        placeholder="Option text"
        required
        className="min-w-[280px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
      />
      <label className="flex items-center gap-1 text-sm">
        <input name="is_correct" type="checkbox" value="on" className="rounded" />
        Correct
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-slate-200 px-2 py-1 text-sm hover:bg-slate-300 disabled:opacity-50"
      >
        {isPending ? "…" : "Add option"}
      </button>
    </form>
  );
}
