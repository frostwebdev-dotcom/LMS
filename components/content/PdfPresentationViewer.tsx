"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDocument,
  GlobalWorkerOptions,
  version as pdfjsVersion,
  type PDFDocumentProxy,
} from "pdfjs-dist";

let workerSrcSet = false;
function ensurePdfWorker() {
  if (typeof window === "undefined" || workerSrcSet) return;
  GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs?v=${pdfjsVersion}`;
  workerSrcSet = true;
}

function pdfUrl(src: string) {
  return src.split("#")[0];
}

function PdfPageCanvas({
  doc,
  pageNum,
  width,
}: {
  doc: PDFDocumentProxy;
  pageNum: number;
  width: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (width < 8) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    (async () => {
      try {
        const page = await doc.getPage(pageNum);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const scale = width / base.width;
        const viewport = page.getViewport({ scale });
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;
        const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        });
        await renderTask.promise;
      } catch {
        /* ignore teardown races */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doc, pageNum, width]);

  return (
    <div className="flex w-full justify-center bg-slate-800/90 py-1">
      <canvas
        ref={canvasRef}
        className="max-w-full shadow-sm"
        aria-hidden
      />
    </div>
  );
}

/**
 * Renders PDF pages with PDF.js (canvas) so the document stays inside the app.
 * Mobile browsers often refuse to embed PDFs in iframes and show an "Open" action instead.
 */
interface PdfPresentationViewerProps {
  src: string;
  title?: string;
  className?: string;
  /** Reserved: native chrome is not used; viewing is in-app only. */
  restrictBrowserChrome?: boolean;
}

export function PdfPresentationViewer({
  src,
  title = "PDF document",
  className = "",
  restrictBrowserChrome: _restrictBrowserChrome = false,
}: PdfPresentationViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [width, setWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    ensurePdfWorker();
    const url = pdfUrl(src);
    let cancelled = false;

    setLoading(true);
    setError(null);
    setDoc(null);
    setNumPages(0);
    docRef.current?.destroy();
    docRef.current = null;

    const task = getDocument({
      url,
      withCredentials: true,
    });

    task.promise
      .then((pdf) => {
        if (cancelled) {
          pdf.destroy();
          return;
        }
        docRef.current = pdf;
        setDoc(pdf);
        setNumPages(pdf.numPages);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Could not load this document."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      void task.destroy();
      void docRef.current?.destroy();
      docRef.current = null;
    };
  }, [src]);

  const pageNumbers =
    numPages > 0 ? Array.from({ length: numPages }, (_, i) => i + 1) : [];

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full flex-col overflow-hidden bg-slate-900/95 ${className}`}
      role="region"
      aria-label={title}
    >
      {loading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-primary-100">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500"
            aria-hidden
          />
          <span>Loading document…</span>
        </div>
      )}
      {!loading && error && (
        <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-red-200">
          {error}
        </div>
      )}
      {!loading && !error && doc && width > 0 && (
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-0.5 pb-2">
            {pageNumbers.map((n) => (
              <PdfPageCanvas key={n} doc={doc} pageNum={n} width={width} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
