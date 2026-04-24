import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import { getAdminDashboardStats } from "@/services/admin-dashboard-service";
import { getAdminTrainingByCategory } from "@/services/admin-training-by-category-service";
import { AdminDashboardSummary } from "@/components/admin/AdminDashboardSummary";
import { AdminTrainingCategoriesSection } from "@/components/admin/training/AdminTrainingCategoriesSection";

export default async function AdminDashboardPage() {
  await requireAdminOrRedirect();
  const [stats, trainingByCategory] = await Promise.all([
    getAdminDashboardStats(),
    getAdminTrainingByCategory(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
          Admin dashboard
        </h1>
        <p className="mt-1 text-primary-700 sm:mt-2">
          Manage training modules, content, quizzes, and view staff progress.
        </p>
      </header>

      <AdminDashboardSummary stats={stats} />

      <AdminTrainingCategoriesSection blocks={trainingByCategory} />
    </div>
  );
}
