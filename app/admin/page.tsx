import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import { getAdminDashboardStats } from "@/services/admin-dashboard-service";
import { getAllModulesForAdmin } from "@/services/module-service";
import { AdminDashboardSummary } from "@/components/admin/AdminDashboardSummary";

export default async function AdminDashboardPage() {
  await requireAdminOrRedirect();
  const [stats, modules] = await Promise.all([
    getAdminDashboardStats(),
    getAllModulesForAdmin(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Admin dashboard
        </h1>
        <p className="mt-1 text-slate-600 sm:mt-2">
          Manage training modules, content, quizzes, and view staff progress.
        </p>
      </header>

      <AdminDashboardSummary stats={stats} />

      {/* Extensible: add more sections below (e.g. recent activity, quick actions) */}
      <section aria-labelledby="modules-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="modules-heading" className="text-lg font-semibold text-slate-900">
            Modules
          </h2>
          <Link
            href="/admin/modules/new"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Add module
          </Link>
        </div>
        {modules.length === 0 ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
            No modules yet. Create one to get started.
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {modules.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/modules/${m.id}`}
                  className="block rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <span className="font-medium text-slate-900">{m.title}</span>
                  <span className="ml-2 text-sm text-slate-500">
                    {m.is_published ? "Published" : "Draft"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
