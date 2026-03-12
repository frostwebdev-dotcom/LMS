import Link from "next/link";
import { getAllModulesForAdmin } from "@/services/module-service";

export default async function AdminDashboardPage() {
  const modules = await getAllModulesForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Admin dashboard</h1>
      <p className="text-slate-600">
        Manage training modules, content, quizzes, and view staff progress.
      </p>
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Modules</h2>
        {modules.length === 0 ? (
          <p className="text-slate-600">No modules yet.</p>
        ) : (
          <ul className="space-y-2">
            {modules.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/modules/${m.id}`}
                  className="block rounded-lg border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">{m.title}</span>
                  <span className="ml-2 text-sm text-slate-500">
                    {m.is_published ? "Published" : "Draft"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/admin/modules/new"
          className="mt-3 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Add module
        </Link>
      </section>
    </div>
  );
}
