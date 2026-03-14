"use client";

import Link from "next/link";
import { useTransition } from "react";
import { markLessonCompleteAction } from "@/app/actions/lesson-progress";
import type { ContentType } from "@/types/database";

interface ContentViewerProps {
  contentType: ContentType;
  /** Signed URL for media (video/pdf/image). Empty for text or when unavailable. */
  signedUrl: string;
  /** Plain text for lesson_type = 'text'. */
  contentText?: string | null;
  contentId: string;
  moduleId: string;
  prevHref: string | null;
  nextHref: string | null;
}

export function ContentViewer({
  contentType,
  signedUrl,
  contentText,
  contentId,
  moduleId,
  prevHref,
  nextHref,
}: ContentViewerProps) {
  const [isPending, startTransition] = useTransition();

  const handleMarkComplete = () => {
    startTransition(async () => {
      await markLessonCompleteAction(contentId);
    });
  };

  const isMedia = contentType === "video" || contentType === "pdf" || contentType === "image";
  const hasMedia = isMedia && !!signedUrl;
  const hasText = contentType === "text" && contentText;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {contentType === "video" && hasMedia && (
          <video
            src={signedUrl}
            controls
            className="w-full aspect-video"
            onEnded={handleMarkComplete}
          />
        )}
        {contentType === "pdf" && hasMedia && (
          <iframe
            src={signedUrl}
            title="PDF"
            className="w-full aspect-video min-h-[60vh]"
          />
        )}
        {contentType === "image" && hasMedia && (
          <div className="flex justify-center bg-slate-100 p-4 min-h-[40vh]">
            <img
              src={signedUrl}
              alt="Image"
              className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
              draggable={false}
            />
          </div>
        )}
        {contentType === "text" && (
          <div className="p-4 sm:p-6 min-h-[200px]">
            {hasText ? (
              <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap">
                {contentText}
              </div>
            ) : (
              <p className="text-slate-500">No text content.</p>
            )}
          </div>
        )}
        {isMedia && !hasMedia && (
          <div className="flex aspect-video items-center justify-center text-slate-500 p-6">
            Unable to load media. The file may be missing or unavailable.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={isPending}
          className="order-2 sm:order-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition"
        >
          {isPending ? "Saving…" : "Mark as complete"}
        </button>
        <nav className="flex gap-2 order-1 sm:order-2" aria-label="Lesson navigation">
          {prevHref && (
            <Link
              href={prevHref}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              ← Previous
            </Link>
          )}
          {nextHref && (
            <Link
              href={nextHref}
              className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition"
            >
              Next →
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
