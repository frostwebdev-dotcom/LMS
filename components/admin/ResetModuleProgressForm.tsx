"use client";

import { useActionState } from "react";
import { resetModuleProgressForAllActionForm } from "@/app/actions/progress-reset";
import type { ProgressResetResult } from "@/app/actions/progress-reset";

interface ResetModuleProgressFormProps {
  moduleId: string;
  moduleTitle: string;
  /** If true, use compact styling (e.g. for progress page list). */
  compact?: boolean;
}

export function ResetModuleProgressForm({
  moduleId,
  moduleTitle,
  compact = false,
}: ResetModuleProgressFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: ProgressResetResult | null, fd: FormData) =>
      resetModuleProgressForAllActionForm(fd),
    null as ProgressResetResult | null
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Reset all staff progress for "${moduleTitle}"? Everyone will need to re-complete lessons and re-take the quiz. This cannot be undone.`
          )
        ) {
          e.preventDefault();
        }
      }}
      className={compact ? "inline" : "mt-2"}
    >
      <input type="hidden" name="module_id" value={moduleId} />
      <button
        type="submit"
        disabled={isPending}
        className={
          compact
            ? "rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            : "rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
        }
      >
        {isPending ? "Resetting…" : "Reset training for all staff"}
      </button>
      {state?.success === false && state.error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.success === true && (
        <p className="mt-2 text-sm text-emerald-600" role="status">
          Progress reset.
        </p>
      )}
    </form>
  );
}
