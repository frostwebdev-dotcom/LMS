import Link from "next/link";
import { ModuleCategoryFilterChips } from "@/components/admin/ModuleCategoryFilterChips";
import { getAllModulesForAdmin } from "@/services/module-service";
import { getTrainingCategoriesForAdmin } from "@/services/training-category-service";

interface PageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

function parseCategoryParam(raw: string | string[] | undefined): string | null {
  if (raw == null) return null;
  const s = Array.isArray(raw) ? raw[0] : raw;
  const t = typeof s === "string" ? s.trim() : "";
  return t === "" ? null : t;
}

export default async function AdminModulesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categorySlug = parseCategoryParam(params.category);

  const [modules, categories] = await Promise.all([
    getAllModulesForAdmin(),
    getTrainingCategoriesForAdmin(),
  ]);

  const knownSlugs = new Set(categories.map((c) => c.slug));
  const slugIsValid = categorySlug != null && knownSlugs.has(categorySlug);
  const invalidSlug = categorySlug != null && !slugIsValid;

  const displayedModules =
    slugIsValid && categorySlug != null
      ? modules.filter((m) => m.category?.slug === categorySlug)
      : modules;

  const activeLabel =
    slugIsValid && categorySlug != null
      ? categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Training modules</h1>
        <Link
          href="/admin/modules/new"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Add module
        </Link>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-slate-600">Filter by training category</p>
        <ModuleCategoryFilterChips categories={categories} activeSlug={slugIsValid ? categorySlug : null} />
      </div>

      {invalidSlug && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          No category matches &quot;{categorySlug}&quot;. Showing all modules.{" "}
          <Link href="/admin/modules" className="font-medium underline-offset-2 hover:underline">
            Clear filter
          </Link>
        </div>
      )}

      {slugIsValid && activeLabel && (
        <p className="text-sm text-slate-600">
          Showing modules in <span className="font-medium text-slate-800">{activeLabel}</span> (
          {displayedModules.length} of {modules.length}).
        </p>
      )}

      {displayedModules.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
          {slugIsValid ? (
            <>
              <p>No modules in this category yet.</p>
              <Link
                href="/admin/modules/new"
                className="mt-3 inline-block text-sm font-medium text-primary-600 hover:text-primary-800"
              >
                Add module
              </Link>
            </>
          ) : (
            <p>No modules. Create one to get started.</p>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {displayedModules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/modules/${m.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <span className="font-medium text-slate-800">{m.title}</span>
                <span className="text-sm text-slate-500">
                  Order: {m.sort_order} · {m.is_published ? "Published" : "Draft"}
                  {m.category?.name ? ` · ${m.category.name}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
