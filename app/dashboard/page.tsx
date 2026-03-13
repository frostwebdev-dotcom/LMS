import { requireUserOrRedirect } from "@/lib/auth/get-session";
import { getStaffDashboardModules } from "@/services/staff-dashboard-service";
import { StaffDashboardContent } from "@/components/dashboard/StaffDashboardContent";

export default async function DashboardPage() {
  const user = await requireUserOrRedirect();
  const modules = await getStaffDashboardModules(user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Training modules
        </h1>
        <p className="mt-1 text-slate-600 sm:mt-2">
          Browse your assigned modules. Complete lessons and quizzes to track your progress.
        </p>
      </header>
      <StaffDashboardContent modules={modules} />
    </div>
  );
}
