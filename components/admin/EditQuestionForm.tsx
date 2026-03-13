"use client";

import { useActionState } from "react";

type Result = { success: true } | { success: false; error: string };

interface EditQuestionFormProps {
  questionId: string;
  moduleId: string;
  initialQuestionText: string;
  initialSortOrder: number;
  action: (
    questionId: string,
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<Result>;
}

export function EditQuestionForm({
  questionId,
  moduleId,
  initialQuestionText,
  initialSortOrder,
  action,
}: EditQuestionFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: Result | null, fd: FormData) => action(questionId, moduleId, _prev, fd),
    null as Result | null
  );

  return (
    <form action={formAction} className="mt-2 space-y-2">
      {state?.success === false && state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <div>
        <label htmlFor={`q-text-${questionId}`} className="sr-only">
          Question text
        </label>
        <input
          id={`q-text-${questionId}`}
          name="question_text"
          defaultValue={initialQuestionText}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`q-sort-${questionId}`} className="text-sm text-slate-600">
          Order
        </label>
        <input
          id={`q-sort-${questionId}`}
          name="sort_order"
          type="number"
          min={0}
          defaultValue={initialSortOrder}
          className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save question"}
        </button>
      </div>
    </form>
  );
}
