import { Suspense } from "react";
import { getStaffProgress, getStaffProgressFilterOptions } from "@/services/admin-progress-service";
import { ResetModuleProgressForm } from "@/components/admin/ResetModuleProgressForm";
import { ProgressFilters } from "@/components/admin/ProgressFilters";
import { ProgressReviewTable } from "@/components/admin/ProgressReviewTable";

interface PageProps {
  searchParams: Promise<{ staff?: string; module?: string }>;
}

export default async function AdminProgressPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const staffId = params.staff && params.staff.trim() ? params.staff.trim() : undefined;
  const moduleId = params.module && params.module.trim() ? params.module.trim() : undefined;

  const [rows, filterOptions] = await Promise.all([
    getStaffProgress({ staffId, moduleId }),
    getStaffProgressFilterOptions(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Staff progress</h1>
        <p className="mt-1 text-slate-600">
          View training progress by employee and module. Filter below to narrow results.
        </p>
      </header>

      <Suspense fallback={<div className="h-14 rounded-lg border border-slate-200 bg-slate-50 animate-pulse" />}>
        <ProgressFilters
          staffOptions={filterOptions.staff}
          moduleOptions={filterOptions.modules}
          currentStaffId={staffId ?? null}
          currentModuleId={moduleId ?? null}
        />
      </Suspense>

      {filterOptions.modules.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">
            Reset training (e.g. annual)
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Clear all staff progress for a module so everyone must re-complete it.
          </p>
          <ul className="flex flex-wrap gap-2">
            {filterOptions.modules.map((m) => (
              <li key={m.id}>
                <ResetModuleProgressForm
                  moduleId={m.id}
                  moduleTitle={m.title}
                  compact
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="sr-only">Progress results</h2>
        <ProgressReviewTable rows={rows} />
      </section>
    </div>
  );
}
