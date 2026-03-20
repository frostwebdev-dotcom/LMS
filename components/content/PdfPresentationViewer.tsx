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
  /**
   * Uses PDF open parameters to hide the browser’s PDF toolbar (and its download control)
   * where supported (e.g. Chromium). Does not prevent determined users from saving the file.
   */
  restrictBrowserChrome?: boolean;
}

/** PDF open parameters: fit to width; optional minimal chrome for staff viewers. */
function pdfFragment(restrictBrowserChrome: boolean) {
  if (restrictBrowserChrome) {
    return "#toolbar=0&navpanes=0&view=FitH";
  }
  return "#view=FitH";
}

export function PdfPresentationViewer({
  src,
  title = "PDF document",
  className = "",
  restrictBrowserChrome = false,
}: PdfPresentationViewerProps) {
  const urlWithView = useMemo(() => {
    const base = src.split("#")[0];
    return `${base}${pdfFragment(restrictBrowserChrome)}`;
  }, [src, restrictBrowserChrome]);

  return (
    <iframe
      src={urlWithView}
      title={title}
      className={`h-full w-full border-0 ${className}`}
      allow="fullscreen"
      allowFullScreen
      referrerPolicy="no-referrer"
    />
  );
}
