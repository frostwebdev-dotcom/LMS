import type { StaffDashboardModule } from "@/types/dashboard";
import { ModuleCard } from "./ModuleCard";

interface StaffDashboardContentProps {
  modules: StaffDashboardModule[];
}

export function StaffDashboardContent({ modules }: StaffDashboardContentProps) {
  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center sm:p-10">
        <p className="text-slate-600">
          No training modules available yet. Check back later or contact your
          administrator.
        </p>
      </div>
    );
  }

  return (
    <ul
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Training module list"
    >
      {modules.map((module) => (
        <li key={module.id}>
          <ModuleCard module={module} />
        </li>
      ))}
    </ul>
  );
}
