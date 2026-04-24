import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/auth/get-session";
import { getStaffDashboardModules } from "@/services/staff-dashboard-service";
import { StaffDashboardContent } from "@/components/dashboard/StaffDashboardContent";
import { StaffComplianceSummary } from "@/components/dashboard/StaffComplianceSummary";

export default async function DashboardPage() {
  const user = await requireUserOrRedirect();
  const modules = await getStaffDashboardModules(user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
          Training modules
        </h1>
        <p className="mt-1 text-primary-700 sm:mt-2">
          Browse your assigned modules. Complete lessons and quizzes to track your progress.
        </p>
        <p className="mt-2">
          <Link
            href="/dashboard/certificates"
            className="text-sm font-semibold text-primary-800 underline-offset-2 hover:underline"
          >
            My certificates
          </Link>
          <span className="text-sm text-primary-600"> — view and download completion PDFs</span>
        </p>
      </header>
      <StaffComplianceSummary modules={modules} />
      <StaffDashboardContent modules={modules} />
    </div>
  );
}
