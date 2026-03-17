import type { ModuleProgressStatus } from "@/types/dashboard";

interface StatusBadgeProps {
  status: ModuleProgressStatus;
  className?: string;
}

const config: Record<
  ModuleProgressStatus,
  { label: string; className: string }
> = {
  not_started: {
    label: "Not started",
    className: "bg-primary-100 text-primary-700",
  },
  in_progress: {
    label: "In progress",
    className: "bg-accent-100 text-accent-800",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-800",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { label, className: statusClass } = config[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass} ${className}`}
    >
      {label}
    </span>
  );
}
