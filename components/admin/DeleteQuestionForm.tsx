"use client";

import { useActionState } from "react";

type Result = { success: true } | { success: false; error: string };

interface DeleteQuestionFormProps {
  questionId: string;
  moduleId: string;
  questionNumber: number;
  action: (formData: FormData) => Promise<Result>;
}

export function DeleteQuestionForm({
  questionId,
  moduleId,
  questionNumber,
  action,
}: DeleteQuestionFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: Result | null, fd: FormData) => action(fd),
    null as Result | null
  );

  return (
    <form
      action={formAction}
      className="inline"
      aria-label={`Delete question ${questionNumber}`}
      onSubmit={(e) => {
        if (!confirm("Delete this question and all its answer options? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="question_id" value={questionId} />
      <input type="hidden" name="module_id" value={moduleId} />
      {state?.success === false && state?.error && (
        <p className="text-sm text-red-600 mb-1" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="text-sm text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Delete question"}
      </button>
    </form>
  );
}
