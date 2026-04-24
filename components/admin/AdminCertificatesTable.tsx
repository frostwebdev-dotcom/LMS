import { formatCertificateDateUtc } from "@/lib/format-completion-date";
import type { AdminCertificateRow } from "@/types/certificates";

function employeeLabel(row: AdminCertificateRow): string {
  const p = row.profiles;
  const n = p?.full_name?.trim();
  if (n) return n;
  return p?.email ?? "—";
}

export function AdminCertificatesTable({ rows }: { rows: AdminCertificateRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-600">
        No certificates match these filters.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">
                Employee
              </th>
              <th scope="col" className="px-4 py-3">
                Email
              </th>
              <th scope="col" className="px-4 py-3">
                Module
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
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{employeeLabel(row)}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-slate-600" title={row.profiles?.email ?? ""}>
                  {row.profiles?.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-800">{row.training_modules?.title ?? "—"}</td>
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
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-semibold text-slate-900">{employeeLabel(row)}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{row.profiles?.email}</p>
            <p className="mt-2 text-sm text-slate-800">{row.training_modules?.title ?? "—"}</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-600">
              <dt className="text-slate-500">Certificate #</dt>
              <dd className="font-mono text-right">{row.certificate_number}</dd>
              <dt className="text-slate-500">Completed</dt>
              <dd className="text-right">{formatCertificateDateUtc(row.completion_date)}</dd>
              <dt className="text-slate-500">Issued</dt>
              <dd className="text-right">{formatCertificateDateUtc(row.issued_at)}</dd>
              <dt className="text-slate-500">Status</dt>
              <dd className="capitalize text-right">{row.status.replaceAll("_", " ")}</dd>
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
  );
}
