"use client";

import { useEffect, useMemo, useState } from "react";

interface CsvViewerProps {
  /** Same-origin token-protected view URL (not a direct storage URL). */
  mediaUrl: string;
  title?: string;
}

/**
 * Fetches CSV from the view URL and renders flashcards. View-only in-app (no download links).
 */
export function CsvViewer({ mediaUrl, title }: CsvViewerProps) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setRows(null);
    fetch(mediaUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load CSV");
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const parsed = parseCsv(text);
        if (parsed.length === 0) setRows([["(empty)"]]);
        else setRows(parsed);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load CSV");
      });
    return () => {
      cancelled = true;
    };
  }, [mediaUrl]);

  useEffect(() => {
    setCardIndex(0);
    setShowBack(false);
  }, [rows]);

  const flashcards = useMemo(() => toFlashcards(rows ?? []), [rows]);
  const current = flashcards[cardIndex] ?? null;

  if (error) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-4 text-primary-700">
        <p>{error}</p>
      </div>
    );
  }

  if (rows === null) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-primary-200 bg-primary-50/50 p-8 text-primary-600">
        Loading CSV…
      </div>
    );
  }

  if (!current) {
    return (
      <div className="rounded-xl border border-primary-200 bg-white p-4 shadow-sm">
        <p className="text-primary-700">No card content found in this CSV.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{title ?? "CSV flashcards"}</span>
        <span>
          Card {cardIndex + 1} of {flashcards.length}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setShowBack((v) => !v)}
        className="min-h-[280px] w-full rounded-xl border border-primary-200 bg-white p-5 text-left shadow-sm transition hover:border-primary-300"
      >
        <p className="mb-2 text-xs uppercase tracking-wide text-primary-600">
          {showBack ? "Back" : "Front"}
        </p>
        <p className="mb-4 text-lg font-semibold text-slate-900 whitespace-pre-wrap">
          {showBack ? current.back : current.front}
        </p>
        {showBack && current.extra.length > 0 && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            {current.extra.map((item) => (
              <p key={item.label} className="text-sm text-slate-700">
                <span className="font-medium text-slate-900">{item.label}: </span>
                <span className="whitespace-pre-wrap">{item.value}</span>
              </p>
            ))}
          </div>
        )}
        <p className="mt-6 text-xs text-slate-500">Click card to flip</p>
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setCardIndex((i) => Math.max(0, i - 1));
            setShowBack(false);
          }}
          disabled={cardIndex === 0}
          className="rounded-lg border border-primary-200 px-3 py-2 text-sm font-medium text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous Card
        </button>
        <button
          type="button"
          onClick={() => {
            setCardIndex((i) => Math.min(flashcards.length - 1, i + 1));
            setShowBack(false);
          }}
          disabled={cardIndex >= flashcards.length - 1}
          className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next Card
        </button>
      </div>
    </div>
  );
}

interface FlashcardRow {
  front: string;
  back: string;
  extra: { label: string; value: string }[];
}

function toFlashcards(rows: string[][]): FlashcardRow[] {
  if (rows.length === 0) return [];

  const hasHeader = rows.length > 1 && looksLikeHeaderRow(rows[0]);
  const headers = hasHeader
    ? rows[0].map((h, i) => h.trim() || `Column ${i + 1}`)
    : [];
  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows
    .filter((row) => row.some((cell) => cell.trim().length > 0))
    .map((row) => {
      const first = (row[0] ?? "").trim();
      const second = (row[1] ?? "").trim();
      const frontLabel = headers[0] ?? "";
      const backLabel = headers[1] ?? "";

      const front = first
        ? (frontLabel ? `${frontLabel}: ${first}` : first)
        : (frontLabel || "No front content");
      const back = second
        ? (backLabel ? `${backLabel}: ${second}` : second)
        : (backLabel || "No back content");

      const extra = row.slice(2).map((value, idx) => ({
        label: headers[idx + 2] ?? `Column ${idx + 3}`,
        value: value ?? "",
      }));

      return { front, back, extra };
    });
}

function looksLikeHeaderRow(row: string[]): boolean {
  const knownHeaderWords = new Set([
    "question",
    "answer",
    "front",
    "back",
    "term",
    "definition",
    "prompt",
    "response",
    "hint",
    "explanation",
  ]);

  const normalized = row
    .map((cell) => cell.trim().toLowerCase())
    .filter((cell) => cell.length > 0);
  if (normalized.length === 0) return false;

  return normalized.every((cell) => knownHeaderWords.has(cell));
}

/**
 * Simple CSV parser: handles quoted fields and commas. Does not handle all RFC 4180 edge cases.
 */
function parseCsv(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  const result: string[][] = [];
  for (const line of lines) {
    result.push(parseCsvLine(line));
  }
  return result;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let field = "";
      i++;
      while (i < line.length) {
        if (line[i] === '"') {
          i++;
          if (line[i] === '"') {
            field += '"';
            i++;
          } else break;
        } else {
          field += line[i];
          i++;
        }
      }
      out.push(field);
      if (line[i] === ",") i++;
    } else {
      let field = "";
      while (i < line.length && line[i] !== ",") {
        field += line[i];
        i++;
      }
      out.push(field.trim());
      if (line[i] === ",") i++;
    }
  }
  return out;
}
