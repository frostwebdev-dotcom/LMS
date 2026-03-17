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
      className="flex flex-col rounded-xl border border-primary-200 bg-white p-4 shadow-sm transition hover:border-primary-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:p-5"
    >
      <div className="flex flex-1 flex-col min-h-0">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-base font-semibold text-primary-900 sm:text-lg min-w-0 flex-1">
            {module.title}
          </h2>
          <StatusBadge status={module.status} />
        </div>
        {module.description && (
          <p className="mb-3 line-clamp-2 flex-1 text-sm text-primary-700 min-h-0">
            {module.description}
          </p>
        )}
        <div className="mt-auto space-y-3">
          <ProgressBar
            value={module.progressPercent}
            label={`${module.progressPercent}% complete`}
            aria-label={`Module progress: ${module.progressPercent}%`}
          />
          {module.quizCount > 0 && (
            <p className="text-xs text-primary-700">
              {module.quizResult ? (
                <span>
                  Quiz: <strong>{module.quizResult.bestScorePercent}%</strong>
                  {module.quizResult.passed ? (
                    <span className="text-emerald-700"> (passed)</span>
                  ) : (
                    <span className="text-accent-700"> (not passed)</span>
                  )}
                </span>
              ) : (
                <span className="text-primary-600">Quiz: Not attempted</span>
              )}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary-600">
            <DurationDisplay minutes={module.estimatedDurationMinutes} />
            <span>{module.contentCount} lesson{module.contentCount !== 1 ? "s" : ""}</span>
            {module.quizCount > 0 && (
              <span>{module.quizCount} quiz</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
