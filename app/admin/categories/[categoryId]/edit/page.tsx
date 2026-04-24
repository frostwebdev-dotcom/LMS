import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { getTrainingCategoryById } from "@/services/training-category-service";

export default async function EditTrainingCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  await requireAdminOrRedirect();
  const { categoryId } = await params;
  const category = await getTrainingCategoryById(categoryId);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/categories" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to categories
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Edit category</h1>
        <p className="mt-1 text-sm text-slate-600">{category.name}</p>
      </div>
      <CategoryForm
        mode="edit"
        categoryId={category.id}
        initialName={category.name}
        initialSlug={category.slug}
        initialDescription={category.description}
        initialIcon={category.icon}
        initialDisplayOrder={category.display_order}
        initialIsActive={category.is_active}
      />
    </div>
  );
}
