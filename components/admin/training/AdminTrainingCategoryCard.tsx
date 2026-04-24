import Link from "next/link";
import type { AdminTrainingCategoryBlock } from "@/types/admin-dashboard";
import { TrainingCategoryIconTile } from "./TrainingCategoryIcon";
import {
  resolveTrainingCategoryVisualTheme,
  trainingCategoryThemeClasses,
} from "./trainingCategoryTheme";

interface AdminTrainingCategoryCardProps {
  block: AdminTrainingCategoryBlock;
}

export function AdminTrainingCategoryCard({ block }: AdminTrainingCategoryCardProps) {
  const { category, modules } = block;
  const count = modules.length;
  const themeKey = resolveTrainingCategoryVisualTheme(category.slug, category.icon);
  const t = trainingCategoryThemeClasses[themeKey];
  const descriptionText =
    category.description?.trim() ||
    (count === 0
      ? "No description yet — add modules to this category."
      : "Training modules for this track.");

  return (
    <article
      id={`training-category-${category.slug}`}
      className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-4 p-4 sm:gap-5 sm:p-5 [&::-webkit-details-marker]:hidden">
          <TrainingCategoryIconTile
            icon={category.icon}
            slug={category.slug}
            label={category.name}
            iconWrapClass={t.iconWrap}
            iconStrokeClass={t.iconStroke}
          />

          <div className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`text-base font-bold sm:text-lg ${t.title}`}>{category.name}</h3>
              {!category.is_active && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                  Inactive
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-slate-500">{descriptionText}</p>
            <p className="sr-only">
              Click to expand modules in {category.name}. Use the filtered module list link inside when expanded.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold tabular-nums sm:text-sm ${t.badge}`}
            >
              {count} module{count === 1 ? "" : "s"}
            </span>
            <svg
              className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </summary>

        <div className="border-t border-slate-100 px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-3 pt-3">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">Modules in this category</p>
            <Link
              href={`/admin/modules?category=${encodeURIComponent(category.slug)}`}
              className="text-xs font-medium text-primary-700 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded sm:text-sm"
            >
              Open filtered list
            </Link>
          </div>
          {count === 0 ? (
            <p className="pt-3 text-sm text-slate-600">
              No modules assigned yet.{" "}
              <Link
                href="/admin/modules/new"
                className="font-medium text-primary-700 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
              >
                Add a module
              </Link>{" "}
              and choose this category.
            </p>
          ) : (
            <ul className="mt-3 space-y-2" role="list">
              {modules.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/admin/modules/${m.id}`}
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border border-transparent px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${t.listRow} ${t.listRowHover}`}
                  >
                    <span className="min-w-0 font-medium text-slate-900">{m.title}</span>
                    <span className="shrink-0 text-xs text-slate-600">
                      {m.is_published ? "Published" : "Draft"}
                      <span className="mx-1.5 text-slate-300" aria-hidden>
                        ·
                      </span>
                      Order {m.sort_order}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </article>
  );
}
