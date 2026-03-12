"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

type ActionResult = { success: true } | { success: false; error: string };

interface ContentEditFormProps {
  contentId: string;
  moduleId: string;
  initialTitle: string;
  initialSortOrder: number;
  action: (
    contentId: string,
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<ActionResult>;
}

export function ContentEditForm({
  contentId,
  moduleId,
  initialTitle,
  initialSortOrder,
  action,
}: ContentEditFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    (_prev: ActionResult | null, fd: FormData) => action(contentId, moduleId, _prev, fd),
    null as ActionResult | null
  );

  if (state?.success) {
    router.push(`/admin/modules/${moduleId}`);
    return null;
  }

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      {state?.success === false && state?.error && (
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
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
