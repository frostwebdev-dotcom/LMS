"use client";

import type { ReactNode } from "react";

/**
 * Wrapper for presentation-style media (video, PDF, image) so they share a
 * consistent, screen-fitting, landscape-oriented layout. Preserves aspect
 * ratio and works on mobile and desktop. Children are absolutely positioned
 * to fill the container (e.g. iframe/video 100% or centered image with object-contain).
 */
interface PresentationContainerProps {
  children: ReactNode;
  /** Aspect ratio for the presentation area. Default 16/9 (landscape). */
  aspectRatio?: "16/9" | "4/3";
  /** Optional extra class for the outer wrapper. */
  className?: string;
}

const aspectMap = {
  "16/9": "aspect-video", // 16/9
  "4/3": "aspect-[4/3]",
} as const;

export function PresentationContainer({
  children,
  aspectRatio = "16/9",
  className = "",
}: PresentationContainerProps) {
  return (
    <div
      className={`w-full overflow-hidden rounded-xl border border-primary-200 bg-primary-900/5 shadow-sm ${className}`}
    >
      <div
        className={`relative w-full ${aspectMap[aspectRatio]}`}
        style={{
          maxHeight: "min(calc(100vh - 12rem), 56.25vw)",
        }}
      >
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  );
}
