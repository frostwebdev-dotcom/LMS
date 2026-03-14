"use client";

import { useActionState } from "react";

type Result = { success: true } | { success: false; error: string };

interface DeleteOptionFormProps {
  optionId: string;
  moduleId: string;
  action: (formData: FormData) => Promise<Result>;
}

export function DeleteOptionForm({
  optionId,
  moduleId,
  action,
}: DeleteOptionFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: Result | null, fd: FormData) => action(fd),
    null as Result | null
  );

  return (
    <form
      action={formAction}
      className="inline"
      aria-label="Remove this answer option"
      onSubmit={(e) => {
        if (!confirm("Remove this answer option?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="option_id" value={optionId} />
      <input type="hidden" name="module_id" value={moduleId} />
      {state?.success === false && state?.error && (
        <span className="text-sm text-red-600 ml-2" role="alert">
          {state.error}
        </span>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="text-sm text-slate-500 hover:text-red-600 hover:underline disabled:opacity-50"
      >
        {isPending ? "…" : "Remove"}
      </button>
    </form>
  );
}
