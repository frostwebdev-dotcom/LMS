"use client";

import Link from "next/link";
import type { ContentType } from "@/types/database";
import { PresentationContainer } from "./PresentationContainer";
import { PdfPresentationViewer } from "./PdfPresentationViewer";

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

/**
 * Displays lesson content. View is recorded automatically by RecordLessonView on the page.
 * Completion happens only at the end of the full training via "Complete Training" on the module page.
 */
export function ContentViewer({
  contentType,
  signedUrl,
  contentText,
  contentId,
  moduleId,
  prevHref,
  nextHref,
}: ContentViewerProps) {
  const isMedia = contentType === "video" || contentType === "pdf" || contentType === "image";
  const hasMedia = isMedia && !!signedUrl;
  const hasText = contentType === "text" && contentText;

  return (
    <div className="space-y-4">
      {contentType === "video" && hasMedia && (
        <PresentationContainer>
          <video
            src={signedUrl}
            controls
            className="h-full w-full object-contain"
            playsInline
          />
        </PresentationContainer>
      )}
      {contentType === "pdf" && hasMedia && (
        <PresentationContainer>
          <PdfPresentationViewer src={signedUrl} title="PDF presentation" />
        </PresentationContainer>
      )}
      {contentType === "image" && hasMedia && (
        <PresentationContainer>
          <div className="flex h-full w-full items-center justify-center bg-white p-2 sm:p-4">
            <img
              src={signedUrl}
              alt="Presentation"
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          </div>
        </PresentationContainer>
      )}
      {contentType === "text" && (
        <div className="rounded-xl border border-primary-200 bg-white p-4 shadow-sm sm:p-6 min-h-[200px]">
          {hasText ? (
            <div className="prose prose-slate max-w-none text-primary-800 whitespace-pre-wrap">
              {contentText}
            </div>
          ) : (
            <p className="text-primary-600">No text content.</p>
          )}
        </div>
      )}
      {isMedia && !hasMedia && (
        <div className="flex aspect-video items-center justify-center rounded-xl border border-primary-200 bg-primary-50/50 p-6 text-primary-700">
          Unable to load media. The file may be missing or unavailable.
        </div>
      )}

      <nav className="flex gap-2" aria-label="Lesson navigation">
        {prevHref && (
          <Link
            href={prevHref}
            className="rounded-lg border border-primary-200 px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-50 transition"
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
  );
}
