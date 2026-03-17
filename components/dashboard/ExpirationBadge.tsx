import type { ExpirationStatus } from "@/types/dashboard";

interface ExpirationBadgeProps {
  status: ExpirationStatus;
  /** Positive = days left, zero or negative = days since expired. */
  daysRemaining: number;
  className?: string;
}

function labelAndClass(status: ExpirationStatus, daysRemaining: number): { label: string; className: string } {
  switch (status) {
    case "valid":
      return {
        label: daysRemaining === 1 ? "1 day left" : `${daysRemaining} days left`,
        className: "bg-emerald-100 text-emerald-800",
      };
    case "expiring_soon":
      return {
        label: daysRemaining === 0 ? "Expires today" : daysRemaining === 1 ? "1 day left" : `${daysRemaining} days left`,
        className: "bg-amber-100 text-amber-800",
      };
    case "expired":
      const d = Math.abs(daysRemaining);
      return {
        label: d === 0 ? "Expired" : d === 1 ? "Expired 1 day ago" : `Expired ${d} days ago`,
        className: "bg-red-100 text-red-800",
      };
  }
}

export function ExpirationBadge({ status, daysRemaining, className = "" }: ExpirationBadgeProps) {
  const { label, className: statusClass } = labelAndClass(status, daysRemaining);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass} ${className}`}
    >
      {status === "valid" && "Valid · "}
      {status === "expiring_soon" && "Expiring soon · "}
      {label}
    </span>
  );
}
