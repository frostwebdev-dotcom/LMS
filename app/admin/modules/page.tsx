import Link from "next/link";
import { getAllModulesForAdmin } from "@/services/module-service";

export default async function AdminModulesPage() {
  const modules = await getAllModulesForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Training modules</h1>
        <Link
          href="/admin/modules/new"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Add module
        </Link>
      </div>
      {modules.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
          No modules. Create one to get started.
        </div>
      ) : (
        <ul className="space-y-2">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/modules/${m.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
              >
                <span className="font-medium text-slate-800">{m.title}</span>
                <span className="text-sm text-slate-500">
                  Order: {m.sort_order} · {m.is_published ? "Published" : "Draft"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
