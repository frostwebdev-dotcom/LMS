import Link from "next/link";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { DEFAULT_TRAINING_CATEGORY_ID } from "@/lib/constants/default-training-category";
import { getTrainingCategoriesForAdmin } from "@/services/training-category-service";

export default async function NewModulePage() {
  const categories = await getTrainingCategoriesForAdmin();
  const initialCategoryId =
    categories.find((c) => c.is_active)?.id ?? DEFAULT_TRAINING_CATEGORY_ID;

  return (
    <div className="space-y-6">
      <Link href="/admin/modules" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to modules
      </Link>
      <h1 className="text-2xl font-bold text-slate-800">New module</h1>
      <ModuleForm categories={categories} initialCategoryId={initialCategoryId} />
    </div>
  );
}
