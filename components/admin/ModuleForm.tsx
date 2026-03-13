"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { createModuleAction, updateModuleAction } from "@/app/actions/modules";
import type { ModuleActionResult } from "@/app/actions/modules";

interface ModuleFormProps {
  initialTitle?: string;
  initialDescription?: string | null;
  initialSortOrder?: number;
  initialPublished?: boolean;
  moduleId?: string;
}

export function ModuleForm({
  initialTitle = "",
  initialDescription = null,
  initialSortOrder = 0,
  initialPublished = false,
  moduleId,
}: ModuleFormProps) {
  const router = useRouter();
  const isEdit = Boolean(moduleId);
  const [state, formAction, isPending] = useActionState(
    isEdit && moduleId
      ? (_prev: ModuleActionResult | null, fd: FormData) =>
          updateModuleAction(moduleId, _prev, fd)
      : (_prev: ModuleActionResult | null, fd: FormData) => createModuleAction(_prev, fd),
    null as ModuleActionResult | null
  );

  useEffect(() => {
    if (state?.success && state.id) {
      router.push(`/admin/modules/${state.id}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      {state?.success === false && state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialTitle}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialDescription ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="sort_order" className="block text-sm font-medium text-slate-700 mb-1">
          Sort order
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          min={0}
          defaultValue={initialSortOrder}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      {isEdit && (
        <div className="flex items-center gap-2">
          <input
            id="is_published"
            name="is_published"
            type="checkbox"
            defaultChecked={initialPublished}
            className="rounded border-slate-300 text-primary-600"
          />
          <label htmlFor="is_published" className="text-sm text-slate-700">
            Published (visible to staff)
          </label>
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isPending ? "Saving…" : isEdit ? "Update module" : "Create module"}
      </button>
    </form>
  );
}
