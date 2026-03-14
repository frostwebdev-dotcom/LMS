"use client";

import { useActionState } from "react";

type Result = { success: true } | { success: false; error: string };

interface EditOptionFormProps {
  optionId: string;
  moduleId: string;
  initialOptionText: string;
  initialIsCorrect: boolean;
  initialSortOrder: number;
  action: (
    optionId: string,
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<Result>;
}

export function EditOptionForm({
  optionId,
  moduleId,
  initialOptionText,
  initialIsCorrect,
  initialSortOrder,
  action,
}: EditOptionFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: Result | null, fd: FormData) => action(optionId, moduleId, _prev, fd),
    null as Result | null
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2 py-1">
      {state?.success === false && state?.error && (
        <span className="w-full text-sm text-red-600">{state.error}</span>
      )}
      <textarea
        name="option_text"
        defaultValue={initialOptionText}
        required
        rows={2}
        className="min-w-[560px] w-full max-w-2xl flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 resize-y"
        aria-label="Option text"
      />
      <label className="flex items-center gap-1 text-sm text-slate-600">
        <input
          name="is_correct"
          type="checkbox"
          value="on"
          defaultChecked={initialIsCorrect}
          className="rounded"
        />
        Correct
      </label>
      <input
        name="sort_order"
        type="number"
        min={0}
        defaultValue={initialSortOrder}
        className="w-14 rounded border border-slate-300 px-2 py-1 text-sm"
        aria-label="Order"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-slate-200 px-2 py-1 text-sm hover:bg-slate-300 disabled:opacity-50"
      >
        {isPending ? "…" : "Save"}
      </button>
    </form>
  );
}
