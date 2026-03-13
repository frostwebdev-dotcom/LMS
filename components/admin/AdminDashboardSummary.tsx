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

export function AdminDashboardSummary({ stats }: AdminDashboardSummaryProps) {
  return (
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
  );
}
