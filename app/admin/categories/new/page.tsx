import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function NewTrainingCategoryPage() {
  await requireAdminOrRedirect();

  return (
    <div className="space-y-6">
      <Link href="/admin/categories" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to categories
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">New training category</h1>
        <p className="mt-1 text-sm text-slate-600">
          After saving, you can assign modules to this category from each module&apos;s settings.
        </p>
      </div>
      <CategoryForm mode="create" />
    </div>
  );
}
