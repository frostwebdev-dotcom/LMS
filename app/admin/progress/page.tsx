import { Suspense } from "react";
import Link from "next/link";
import { getStaffProgress, getStaffProgressFilterOptions } from "@/services/admin-progress-service";
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

      <p className="text-sm text-slate-600">
        To reset all staff progress for a module (e.g. annual re-training), open that module under{" "}
        <Link href="/admin/modules" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
          Modules
        </Link>
        {" "}and use the <strong>Reset training</strong> option there.
      </p>

      <section>
        <h2 className="sr-only">Progress results</h2>
        <ProgressReviewTable rows={rows} />
      </section>
    </div>
  );
}
