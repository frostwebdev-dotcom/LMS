import type { StaffDashboardModule } from "@/types/dashboard";

interface StaffComplianceSummaryProps {
  modules: StaffDashboardModule[];
}

export function StaffComplianceSummary({ modules }: StaffComplianceSummaryProps) {
  const completed = modules.filter((m) => m.status === "completed" && m.expiration);
  const valid = completed.filter((m) => m.expiration!.status === "valid").length;
  const expiringSoon = completed.filter((m) => m.expiration!.status === "expiring_soon").length;
  const expired = completed.filter((m) => m.expiration!.status === "expired").length;

  if (completed.length === 0) return null;

  return (
    <section
      aria-labelledby="compliance-summary-heading"
      className="rounded-xl border border-primary-200 bg-white p-4 sm:p-5"
    >
      <h2 id="compliance-summary-heading" className="text-sm font-semibold text-primary-900 mb-3">
        Your compliance
      </h2>
      <div className="flex flex-wrap gap-4 sm:gap-6">
        <span className="text-sm">
          <span className="font-medium text-emerald-700">{valid}</span>
          <span className="text-primary-700"> valid</span>
        </span>
        <span className="text-sm">
          <span className="font-medium text-amber-700">{expiringSoon}</span>
          <span className="text-primary-700"> expiring soon</span>
        </span>
        <span className="text-sm">
          <span className="font-medium text-red-700">{expired}</span>
          <span className="text-primary-700"> expired</span>
        </span>
      </div>
    </section>
  );
}
