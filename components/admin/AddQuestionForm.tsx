"use client";

import { useActionState } from "react";

type Result = { success: true } | { success: false; error: string };

interface AddQuestionFormProps {
  quizId: string;
  moduleId: string;
  action: (
    quizId: string,
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<Result>;
}

export function AddQuestionForm({ quizId, moduleId, action }: AddQuestionFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: Result | null, fd: FormData) => action(quizId, moduleId, _prev, fd),
    null as Result | null
  );

  return (
    <form action={formAction} className="space-y-2">
      <h2 className="text-lg font-semibold text-slate-800">Add question</h2>
      {state?.success === false && state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <input type="hidden" name="quiz_id" value={quizId} />
      <input
        name="question_text"
        placeholder="Question text"
        required
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
      />
      <input
        name="sort_order"
        type="number"
        min={0}
        defaultValue={0}
        className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isPending ? "Adding…" : "Add question"}
      </button>
    </form>
  );
}
