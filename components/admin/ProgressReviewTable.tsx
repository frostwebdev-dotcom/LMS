import type { StaffProgressRow } from "@/services/admin-progress-service";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ResetUserProgressForm } from "@/components/admin/ResetUserProgressForm";
import type { ModuleProgressStatus } from "@/types/dashboard";

interface ProgressReviewTableProps {
  rows: StaffProgressRow[];
}

function completionStatus(row: StaffProgressRow): ModuleProgressStatus {
  if (row.module_completed_at || row.progress_percent === 100) return "completed";
  if (row.progress_percent > 0) return "in_progress";
  return "not_started";
}

export function ProgressReviewTable({ rows }: ProgressReviewTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
        No progress records match the current filters.
      </p>
    );
  }

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
        <table className="min-w-full text-left text-sm" aria-label="Staff training progress">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-800">Employee</th>
              <th className="px-4 py-3 font-medium text-slate-800">Module</th>
              <th className="px-4 py-3 font-medium text-slate-800">Progress</th>
              <th className="px-4 py-3 font-medium text-slate-800">Quiz score</th>
              <th className="px-4 py-3 font-medium text-slate-800">Status</th>
              <th className="px-4 py-3 font-medium text-slate-800">Reset</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.user_id}-${row.module_id}`} className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                  {row.full_name ?? row.email}
                </td>
                <td className="px-4 py-3 text-slate-700">{row.module_title}</td>
                <td className="px-4 py-3 text-slate-600">{row.progress_percent}%</td>
                <td className="px-4 py-3 text-slate-600">
                  {row.quiz_best_score != null ? (
                    <>
                      {row.quiz_best_score}%
                      {row.quiz_passed ? (
                        <span className="text-emerald-600 ml-1">✓</span>
                      ) : (
                        <span className="text-amber-600 ml-1">(not passed)</span>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={completionStatus(row)} />
                </td>
                <td className="px-4 py-3">
                  <ResetUserProgressForm
                    userId={row.user_id}
                    moduleId={row.module_id}
                    moduleTitle={row.module_title}
                    userName={row.full_name ?? row.email}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden" aria-label="Staff training progress">
        {rows.map((row) => (
          <li key={`${row.user_id}-${row.module_id}`}>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {row.full_name ?? row.email}
                  </p>
                  <p className="text-sm text-slate-600">{row.module_title}</p>
                </div>
                <StatusBadge status={completionStatus(row)} />
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="text-slate-500">Progress</dt>
                <dd className="text-slate-900 font-medium">{row.progress_percent}%</dd>
                <dt className="text-slate-500">Quiz score</dt>
                <dd className="text-slate-900">
                  {row.quiz_best_score != null ? (
                    <>
                      {row.quiz_best_score}%
                      {row.quiz_passed ? " ✓" : " (not passed)"}
                    </>
                  ) : (
                    "—"
                  )}
                </dd>
              </dl>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <ResetUserProgressForm
                  userId={row.user_id}
                  moduleId={row.module_id}
                  moduleTitle={row.module_title}
                  userName={row.full_name ?? row.email}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
