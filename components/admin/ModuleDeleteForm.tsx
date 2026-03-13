"use client";

import { useActionState } from "react";
import { deleteModuleAction } from "@/app/actions/modules";
import type { ModuleActionResult } from "@/app/actions/modules";

interface ModuleDeleteFormProps {
  moduleId: string;
}

export function ModuleDeleteForm({ moduleId }: ModuleDeleteFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: ModuleActionResult | null, fd: FormData) => deleteModuleAction(fd),
    null as ModuleActionResult | null
  );

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="moduleId" value={moduleId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Delete module"}
      </button>
      {state?.success === false && state.error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
