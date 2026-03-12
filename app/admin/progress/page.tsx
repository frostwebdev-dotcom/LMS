import { getStaffProgress } from "@/services/admin-progress-service";

export default async function AdminProgressPage() {
  const rows = await getStaffProgress();

  const byStaff = new Map<
    string,
    { email: string; full_name: string | null; modules: typeof rows }
  >();
  for (const r of rows) {
    const existing = byStaff.get(r.user_id);
    if (!existing) {
      byStaff.set(r.user_id, {
        email: r.email,
        full_name: r.full_name,
        modules: [r],
      });
    } else {
      existing.modules.push(r);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Staff progress</h1>
      <p className="text-slate-600">
        Completion and quiz results per staff member and module.
      </p>
      {byStaff.size === 0 ? (
        <p className="text-slate-600">No staff or no published modules.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-800">Staff</th>
                <th className="px-4 py-3 font-medium text-slate-800">Module</th>
                <th className="px-4 py-3 font-medium text-slate-800">Content</th>
                <th className="px-4 py-3 font-medium text-slate-800">Quiz</th>
                <th className="px-4 py-3 font-medium text-slate-800">Module done</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(byStaff.entries()).map(([userId, { email, full_name, modules }]) =>
                modules.map((m, i) => (
                  <tr key={`${userId}-${m.module_id}`} className="border-b border-slate-100">
                    {i === 0 ? (
                      <td
                        rowSpan={modules.length}
                        className="px-4 py-3 text-slate-700 whitespace-nowrap"
                      >
                        {full_name ?? email}
                      </td>
                    ) : null}
                    <td className="px-4 py-3 text-slate-700">{m.module_title}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {m.content_completed_count}/{m.content_total_count}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {m.quiz_best_score != null
                        ? `${m.quiz_best_score}%${m.quiz_passed ? " ✓" : ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {m.module_completed_at ? "Yes" : "No"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
