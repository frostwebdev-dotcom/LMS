"use client";

import { useActionState } from "react";
import { resetUserModuleProgressActionForm } from "@/app/actions/progress-reset";
import type { ProgressResetResult } from "@/app/actions/progress-reset";

interface ResetUserProgressFormProps {
  userId: string;
  moduleId: string;
  moduleTitle: string;
  userName: string;
}

export function ResetUserProgressForm({
  userId,
  moduleId,
  moduleTitle,
  userName,
}: ResetUserProgressFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: ProgressResetResult | null, fd: FormData) =>
      resetUserModuleProgressActionForm(fd),
    null as ProgressResetResult | null
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Reset progress for ${userName} in "${moduleTitle}"? They will need to re-complete lessons and re-take the quiz.`
          )
        ) {
          e.preventDefault();
        }
      }}
      className="inline"
    >
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="module_id" value={moduleId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
      >
        {isPending ? "…" : "Reset"}
      </button>
      {state?.success === false && state.error && (
        <span className="ml-1 text-xs text-red-600" role="alert">
          {state.error}
        </span>
      )}
    </form>
  );
}
