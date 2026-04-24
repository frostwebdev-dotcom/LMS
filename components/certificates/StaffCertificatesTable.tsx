"use client";

import { useMemo, useState } from "react";
import { formatCertificateDateUtc } from "@/lib/format-completion-date";
import type { CertificateListRow } from "@/types/certificates";

function displayName(row: CertificateListRow): string {
  const p = row.profiles;
  const n = p?.full_name?.trim();
  if (n) return n;
  if (p?.email) return p.email;
  return "You";
}

export function StaffCertificatesTable({ rows }: { rows: CertificateListRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const title = (row.training_modules?.title ?? "").toLowerCase();
      const num = row.certificate_number.toLowerCase();
      const name = displayName(row).toLowerCase();
      const completed = formatCertificateDateUtc(row.completion_date).toLowerCase();
      return title.includes(q) || num.includes(q) || name.includes(q) || completed.includes(q);
    });
  }, [rows, query]);

  if (rows.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="block min-w-0 flex-1 text-sm font-medium text-slate-700" htmlFor="cert-search">
          Search your certificates
        </label>
        <input
          id="cert-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Module, number, or name…"
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          autoComplete="off"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
          No certificates match your search.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Module
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Recipient
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap">
                    Certificate #
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap">
                    Completed
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap">
                    Issued
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    PDF
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row.training_modules?.title ?? "Training module"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{displayName(row)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.certificate_number}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {formatCertificateDateUtc(row.completion_date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {formatCertificateDateUtc(row.issued_at)}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600">{row.status.replaceAll("_", " ")}</td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`/api/certificates/${row.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-lg bg-primary-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden" role="list">
            {filtered.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold text-slate-900">{row.training_modules?.title ?? "Training module"}</p>
                <dl className="mt-2 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Recipient</dt>
                    <dd className="text-right text-slate-800">{displayName(row)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Certificate #</dt>
                    <dd className="font-mono text-right">{row.certificate_number}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Completed</dt>
                    <dd className="text-right">{formatCertificateDateUtc(row.completion_date)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Issued</dt>
                    <dd className="text-right">{formatCertificateDateUtc(row.issued_at)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Status</dt>
                    <dd className="capitalize text-right">{row.status.replaceAll("_", " ")}</dd>
                  </div>
                </dl>
                <a
                  href={`/api/certificates/${row.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
                >
                  Download PDF
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
