import Link from "next/link";
import type { AdminTrainingCategoryBlock } from "@/types/admin-dashboard";
import { AdminTrainingCategoryCard } from "./AdminTrainingCategoryCard";

interface AdminTrainingCategoriesSectionProps {
  blocks: AdminTrainingCategoryBlock[];
}

export function AdminTrainingCategoriesSection({ blocks }: AdminTrainingCategoriesSectionProps) {
  return (
    <section aria-labelledby="training-categories-heading" className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id="training-categories-heading" className="text-xl font-bold tracking-tight text-primary-900 sm:text-2xl">
            Training Categories
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Organized training modules by service area. Click a category to view modules.
          </p>
        </div>
        <Link
          href="/admin/modules/new"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Add module
        </Link>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          <p>No training categories found. Seed categories in the database, then refresh.</p>
          <p className="mt-3 text-sm">
            <Link
              href="/admin/modules/new"
              className="font-semibold text-primary-700 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            >
              Add module
            </Link>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {blocks.map((block) => (
            <AdminTrainingCategoryCard key={block.category.id} block={block} />
          ))}
        </div>
      )}

      <p className="text-center text-sm text-slate-500 sm:text-left">
        <Link
          href="/admin/modules"
          className="font-medium text-primary-800 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
        >
          View full module list and category filters →
        </Link>
      </p>
    </section>
  );
}
