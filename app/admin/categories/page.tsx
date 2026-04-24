import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import {
  getModuleCountByCategoryId,
  getTrainingCategoriesForAdmin,
} from "@/services/training-category-service";

export default async function AdminCategoriesPage() {
  await requireAdminOrRedirect();
  const [categories, counts] = await Promise.all([
    getTrainingCategoriesForAdmin(),
    getModuleCountByCategoryId(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Training categories</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Organize modules into Homecare, Home Healthcare, Leadership, and custom tracks. Inactive
            categories stay hidden from staff listings but remain assignable for migration.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          New category
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          <p>No categories yet.</p>
          <Link href="/admin/categories/new" className="mt-3 inline-block text-sm font-medium text-primary-600 hover:text-primary-800">
            Create the first category
          </Link>
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {categories.map((c) => {
            const n = counts.get(c.id) ?? 0;
            return (
              <li key={c.id}>
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{c.name}</span>
                      {!c.is_active && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                          Inactive
                        </span>
                      )}
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                        {c.slug}
                      </span>
                      <span className="text-sm text-slate-500 tabular-nums">
                        {n} module{n === 1 ? "" : "s"}
                      </span>
                      <span className="text-sm text-slate-400">· Order {c.display_order}</span>
                    </div>
                    {c.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{c.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/admin/modules?category=${encodeURIComponent(c.slug)}`}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      View modules
                    </Link>
                    <Link
                      href={`/admin/categories/${c.id}/edit`}
                      className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
