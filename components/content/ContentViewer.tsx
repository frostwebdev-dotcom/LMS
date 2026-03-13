"use client";

import Link from "next/link";
import { useTransition } from "react";
import { markLessonCompleteAction } from "@/app/actions/lesson-progress";
import type { ContentType } from "@/types/database";

interface ContentViewerProps {
  contentType: ContentType;
  /** Signed URL for media (video/pdf/presentation). Empty for text or when unavailable. */
  signedUrl: string;
  /** For presentation type: Office Online embed URL so PPT/PPTX display in-browser. Empty to fall back to signedUrl (may download). */
  presentationViewerUrl?: string;
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
  presentationViewerUrl = "",
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

  const isMedia = contentType === "video" || contentType === "pdf" || contentType === "presentation";
  const hasMedia = isMedia && !!signedUrl;
  const hasText = contentType === "text" && contentText;
  const iframeSrc =
    contentType === "presentation" && presentationViewerUrl
      ? presentationViewerUrl
      : signedUrl;
  const hasPresentationViewer = contentType === "presentation" && !!iframeSrc;

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
        {contentType === "presentation" && (hasPresentationViewer ? (
          <>
            <iframe
              src={iframeSrc}
              title="Presentation"
              className="w-full aspect-video min-h-[60vh]"
            />
            {hasMedia && (
              <p className="p-3 text-sm text-slate-600 border-t border-slate-100 bg-slate-50/50">
                If the presentation doesn’t load above,{" "}
                <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 font-medium underline">
                  open or download it here
                </a>.
              </p>
            )}
          </>
        ) : hasMedia ? (
          <p className="p-4 text-slate-600 text-sm">
            This presentation cannot be shown in-browser here. You can{" "}
            <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
              open it in a new tab
            </a>{" "}
            (it may download).
          </p>
        ) : null)}
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
