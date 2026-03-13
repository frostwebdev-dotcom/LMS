"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { deleteContentActionForm } from "@/app/actions/content";
import type { ContentActionResult } from "@/app/actions/content";

interface DeleteLessonButtonProps {
  contentId: string;
  moduleId: string;
  lessonTitle: string;
}

export function DeleteLessonButton({
  contentId,
  moduleId,
  lessonTitle,
}: DeleteLessonButtonProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    (_prev: ContentActionResult | null, fd: FormData) => deleteContentActionForm(fd),
    null as ContentActionResult | null
  );

  if (state?.success) {
    router.refresh();
    return null;
  }

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="contentId" value={contentId} />
      <input type="hidden" name="moduleId" value={moduleId} />
      <button
        type="submit"
        disabled={isPending}
        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
        title={`Delete ${lessonTitle}`}
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
      {state?.success === false && state.error && (
        <span className="ml-2 text-xs text-red-600" role="alert">
          {state.error}
        </span>
      )}
    </form>
  );
}
