import type { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  /** Optional subtitle or description below the value */
  subtitle?: string;
  /** Optional icon or visual element (e.g. SVG) */
  icon?: ReactNode;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  className = "",
}: SummaryCardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
            {value}
          </p>
          {subtitle != null && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {icon != null && (
          <div className="flex-shrink-0 text-slate-400" aria-hidden>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
