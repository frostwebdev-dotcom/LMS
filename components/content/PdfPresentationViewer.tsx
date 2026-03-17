"use client";

import { useMemo } from "react";

/**
 * Renders a PDF as an embedded presentation: visual only, no raw text extraction.
 * Uses an iframe with the PDF URL so the browser's native viewer displays the
 * document. Landscape layout is preserved by fitting the iframe to a
 * presentation-style container and using PDF open parameters where supported.
 */
interface PdfPresentationViewerProps {
  /** Signed or public URL to the PDF file. */
  src: string;
  /** Accessible label for the iframe. */
  title?: string;
  /** Optional class for the iframe wrapper. */
  className?: string;
}

/** PDF open parameters for embedded viewer: fit to width to preserve landscape. */
const PDF_VIEW_PARAMS = "#view=FitH";

export function PdfPresentationViewer({
  src,
  title = "PDF document",
  className = "",
}: PdfPresentationViewerProps) {
  const urlWithView = useMemo(() => {
    const base = src.split("#")[0];
    return `${base}${PDF_VIEW_PARAMS}`;
  }, [src]);

  return (
    <iframe
      src={urlWithView}
      title={title}
      className={`h-full w-full border-0 ${className}`}
      allow="fullscreen"
      allowFullScreen
    />
  );
}
