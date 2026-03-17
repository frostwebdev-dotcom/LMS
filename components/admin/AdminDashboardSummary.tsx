import Link from "next/link";
import type { AdminDashboardStats } from "@/types/admin-dashboard";
import { SummaryCard } from "@/components/ui/SummaryCard";

interface AdminDashboardSummaryProps {
  stats: AdminDashboardStats;
}

const cardConfig = [
  {
    key: "totalStaff" as const,
    title: "Total staff",
    subtitle: "Users with staff role",
  },
  {
    key: "totalModules" as const,
    title: "Total modules",
    subtitle: "All training modules",
  },
  {
    key: "completedModules" as const,
    title: "Completed modules",
    subtitle: "Module completions by staff",
  },
  {
    key: "inProgressTraining" as const,
    title: "In-progress training",
    subtitle: "Started but not completed",
  },
];

const complianceConfig = [
  { key: "valid" as const, title: "Valid", subtitle: "Within compliance window", className: "text-emerald-700" },
  { key: "expiringSoon" as const, title: "Expiring soon", subtitle: "Within 30 days of expiry", className: "text-amber-700" },
  { key: "expired" as const, title: "Expired", subtitle: "Past expiration date", className: "text-red-700" },
];

export function AdminDashboardSummary({ stats }: AdminDashboardSummaryProps) {
  return (
    <>
      <section aria-labelledby="dashboard-stats-heading">
        <h2 id="dashboard-stats-heading" className="sr-only">
          Dashboard summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cardConfig.map(({ key, title, subtitle }) => (
            <SummaryCard
              key={key}
              title={title}
              value={stats[key]}
              subtitle={subtitle}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="compliance-heading" className="rounded-xl border border-primary-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 id="compliance-heading" className="text-lg font-semibold text-primary-900">
            Compliance
          </h2>
          <Link
            href="/admin/progress"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
          >
            View progress →
          </Link>
        </div>
        <p className="text-sm text-primary-700 mb-4">
          Completed trainings by expiration status. Valid = within window; Expiring soon = within 30 days; Expired = past due.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {complianceConfig.map(({ key, title, subtitle, className }) => (
            <div
              key={key}
              className="rounded-lg border border-primary-100 bg-primary-50/30 p-4"
            >
              <p className="text-sm font-medium text-primary-600">{title}</p>
              <p className={`mt-1 text-2xl font-bold tabular-nums sm:text-3xl ${className}`}>
                {stats.compliance[key]}
              </p>
              <p className="mt-0.5 text-xs text-primary-600">{subtitle}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
