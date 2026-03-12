"use client";

import Link from "next/link";
import { useTransition } from "react";
import type { ContentType } from "@/types/database";

interface ContentViewerProps {
  contentType: ContentType;
  signedUrl: string;
  contentId: string;
  moduleId: string;
  markCompleteAction: () => Promise<void>;
  prevHref: string | null;
  nextHref: string | null;
}

export function ContentViewer({
  contentType,
  signedUrl,
  markCompleteAction,
  prevHref,
  nextHref,
}: ContentViewerProps) {
  const [isPending, startTransition] = useTransition();

  const handleMarkComplete = () => {
    startTransition(async () => {
      await markCompleteAction();
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {contentType === "video" && signedUrl && (
          <video
            src={signedUrl}
            controls
            className="w-full aspect-video"
            onEnded={handleMarkComplete}
          />
        )}
        {(contentType === "pdf" || contentType === "presentation") && signedUrl && (
          <iframe
            src={signedUrl}
            title="Content"
            className="w-full aspect-video min-h-[60vh]"
          />
        )}
        {!signedUrl && (
          <div className="flex aspect-video items-center justify-center text-slate-500">
            Unable to load content.
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={isPending}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Mark as complete"}
        </button>
        <div className="flex gap-2">
          {prevHref && (
            <Link
              href={prevHref}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Previous
            </Link>
          )}
          {nextHref && (
            <Link
              href={nextHref}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
