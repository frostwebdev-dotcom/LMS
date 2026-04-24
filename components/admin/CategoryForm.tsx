"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import {
  createTrainingCategoryAction,
  updateTrainingCategoryAction,
  type TrainingCategoryActionResult,
} from "@/app/actions/training-categories";

export type CategoryFormMode = "create" | "edit";

export interface CategoryFormProps {
  mode: CategoryFormMode;
  categoryId?: string;
  initialName?: string;
  initialSlug?: string;
  initialDescription?: string | null;
  initialIcon?: string | null;
  initialDisplayOrder?: number;
  initialIsActive?: boolean;
}

export function CategoryForm({
  mode,
  categoryId,
  initialName = "",
  initialSlug = "",
  initialDescription = null,
  initialIcon = null,
  initialDisplayOrder = 0,
  initialIsActive = true,
}: CategoryFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit" && Boolean(categoryId);
  const [state, formAction, isPending] = useActionState(
    isEdit && categoryId
      ? (_prev: TrainingCategoryActionResult | null, fd: FormData) =>
          updateTrainingCategoryAction(categoryId, _prev, fd)
      : (_prev: TrainingCategoryActionResult | null, fd: FormData) => createTrainingCategoryAction(_prev, fd),
    null as TrainingCategoryActionResult | null
  );

  useEffect(() => {
    if (state?.success && state.id && mode === "create") {
      router.push(`/admin/categories/${state.id}/edit`);
    }
  }, [state, router, mode]);

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state?.success === false && state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </div>
      )}
      {state?.success === true && isEdit && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Category saved.
        </div>
      )}

      <div>
        <label htmlFor="cat-name" className="mb-1 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="cat-name"
          name="name"
          type="text"
          required
          maxLength={200}
          defaultValue={initialName}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="cat-slug" className="mb-1 block text-sm font-medium text-slate-700">
          URL slug
        </label>
        <input
          id="cat-slug"
          name="slug"
          type="text"
          required
          maxLength={120}
          defaultValue={initialSlug}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900"
          autoComplete="off"
          spellCheck={false}
        />
        <p className="mt-1 text-xs text-slate-500">
          Lowercase letters, numbers, and hyphens only. Used in links (e.g. <code className="rounded bg-slate-100 px-1">?category=</code>).
        </p>
      </div>

      <div>
        <label htmlFor="cat-description" className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="cat-description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={initialDescription ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>

      <div>
        <label htmlFor="cat-icon" className="mb-1 block text-sm font-medium text-slate-700">
          Icon hint (optional)
        </label>
        <input
          id="cat-icon"
          name="icon"
          type="text"
          maxLength={120}
          defaultValue={initialIcon ?? ""}
          placeholder="e.g. home, stethoscope, users"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          autoComplete="off"
        />
        <p className="mt-1 text-xs text-slate-500">Short label for the dashboard icon mapper.</p>
      </div>

      <div>
        <label htmlFor="cat-display-order" className="mb-1 block text-sm font-medium text-slate-700">
          Display order
        </label>
        <input
          id="cat-display-order"
          name="display_order"
          type="number"
          min={0}
          max={10000}
          defaultValue={initialDisplayOrder}
          className="w-full max-w-[10rem] rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
        <p className="mt-1 text-xs text-slate-500">Lower numbers appear first in lists.</p>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="cat-is-active"
          name="is_active"
          type="checkbox"
          defaultChecked={initialIsActive}
          value="true"
          className="rounded border-slate-300 text-primary-600"
        />
        <label htmlFor="cat-is-active" className="text-sm text-slate-700">
          Active (visible to staff when assigned to published modules)
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {isPending ? "Saving…" : isEdit ? "Save category" : "Create category"}
      </button>
    </form>
  );
}
