"use client";

import { useEffect, useRef } from "react";
import { markLessonCompleteAction } from "@/app/actions/lesson-progress";

/**
 * Records that the current user has viewed this lesson (for completion rules).
 * Runs once on mount. Module completion is separate and happens via "Complete Training" at the end.
 */
export function RecordLessonView({ contentId }: { contentId: string }) {
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    markLessonCompleteAction(contentId).catch(() => {
      // Ignore errors (e.g. unauth); completion rules will re-check on server
    });
  }, [contentId]);
  return null;
}
