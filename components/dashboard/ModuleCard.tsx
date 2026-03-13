import Link from "next/link";
import type { StaffDashboardModule } from "@/types/dashboard";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { DurationDisplay } from "./DurationDisplay";

interface ModuleCardProps {
  module: StaffDashboardModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Link
      href={`/dashboard/modules/${module.id}`}
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            {module.title}
          </h2>
          <StatusBadge status={module.status} />
        </div>
        {module.description && (
          <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-600">
            {module.description}
          </p>
        )}
        <div className="mt-auto space-y-3">
          <ProgressBar
            value={module.progressPercent}
            label={`${module.progressPercent}% complete`}
            aria-label={`Module progress: ${module.progressPercent}%`}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <DurationDisplay minutes={module.estimatedDurationMinutes} />
            <span>{module.contentCount} lesson{module.contentCount !== 1 ? "s" : ""}</span>
            <span>
              {module.quizCount} quiz{module.quizCount !== 1 ? "zes" : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
