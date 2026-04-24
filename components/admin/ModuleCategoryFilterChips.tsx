import Link from "next/link";
import type { TrainingCategory } from "@/types/database";

interface ModuleCategoryFilterChipsProps {
  categories: TrainingCategory[];
  /** Active filter from URL `?category=` (slug), or null for all modules. */
  activeSlug: string | null;
}

const chipBase =
  "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";
const chipInactive = "border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50";
const chipActive = "border-primary-600 bg-primary-600 text-white";

export function ModuleCategoryFilterChips({ categories, activeSlug }: ModuleCategoryFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="navigation" aria-label="Filter modules by category">
      <Link
        href="/admin/modules"
        className={`${chipBase} ${activeSlug == null ? chipActive : chipInactive}`}
      >
        All modules
      </Link>
      {categories.map((c) => {
        const isActive = activeSlug === c.slug;
        return (
          <Link
            key={c.id}
            href={`/admin/modules?category=${encodeURIComponent(c.slug)}`}
            className={`${chipBase} ${isActive ? chipActive : chipInactive}`}
          >
            {c.name}
            {!c.is_active ? " (inactive)" : ""}
          </Link>
        );
      })}
    </div>
  );
}
