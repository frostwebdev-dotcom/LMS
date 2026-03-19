"use client";

import { useEffect, useState } from "react";

interface CsvViewerProps {
  signedUrl: string;
  title?: string;
}

/**
 * Fetches CSV from signedUrl, parses it, and renders as a table with a download link.
 * Falls back to download-only if fetch or parse fails.
 */
export function CsvViewer({ signedUrl, title }: CsvViewerProps) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setRows(null);
    fetch(signedUrl)
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
  }, [signedUrl]);

  if (error) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-4 text-primary-700">
        <p className="mb-2">{error}</p>
        <a
          href={signedUrl}
          download
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          Download CSV
        </a>
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

  const colCount = Math.max(...rows.map((r) => r.length), 1);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-primary-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={
                  i === 0
                    ? "border-b border-primary-200 bg-primary-50/70 font-medium text-primary-900"
                    : "border-b border-slate-100 text-slate-700 last:border-b-0"
                }
              >
                {Array.from({ length: colCount }, (_, j) => (
                  <td
                    key={j}
                    className="border-r border-slate-100 px-3 py-2 last:border-r-0"
                  >
                    {row[j] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        <a
          href={signedUrl}
          download
          className="font-medium text-primary-600 hover:underline"
        >
          Download CSV
        </a>
      </p>
    </div>
  );
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
