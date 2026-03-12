"use client";

import { useActionState } from "react";

type ActionResult = { success: true; id?: string } | { success: false; error: string };

interface ModuleFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  initialTitle?: string;
  initialDescription?: string | null;
  initialSortOrder?: number;
  initialPublished?: boolean;
  moduleId?: string;
  updateAction?: (moduleId: string, prev: unknown, formData: FormData) => Promise<ActionResult>;
}

export function ModuleForm({
  action,
  initialTitle = "",
  initialDescription = null,
  initialSortOrder = 0,
  initialPublished = false,
  moduleId,
  updateAction,
}: ModuleFormProps) {
  const isEdit = Boolean(moduleId && updateAction);
  const [state, formAction, isPending] = useActionState(
    isEdit && updateAction && moduleId
      ? (prev: ActionResult | null, fd: FormData) => updateAction(moduleId, prev, fd)
      : (_prev: ActionResult | null, fd: FormData) => action(fd),
    null as ActionResult | null
  );

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
