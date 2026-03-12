"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

type ActionResult = { success: true; id?: string } | { success: false; error: string };

interface ContentUploadFormProps {
  moduleId: string;
  action: (
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<ActionResult>;
}

export function ContentUploadForm({ moduleId, action }: ContentUploadFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    (_prev: ActionResult | null, fd: FormData) => action(moduleId, _prev, fd),
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
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="content_type" className="block text-sm font-medium text-slate-700 mb-1">
          Type
        </label>
        <select
          id="content_type"
          name="content_type"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        >
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="presentation">Presentation</option>
        </select>
      </div>
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-slate-700 mb-1">
          File
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept="video/*,.pdf,.ppt,.pptx"
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
          defaultValue={0}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isPending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
