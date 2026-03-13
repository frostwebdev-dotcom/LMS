import { notFound } from "next/navigation";
import Link from "next/link";
import { getModuleById } from "@/services/module-service";
import { getContentById } from "@/services/content-service";
import { ContentEditForm } from "@/components/admin/ContentEditForm";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ moduleId: string; contentId: string }>;
}) {
  const { moduleId, contentId } = await params;
  const [module, content] = await Promise.all([
    getModuleById(moduleId),
    getContentById(contentId),
  ]);
  if (!module || !content || content.module_id !== module.id) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/modules/${moduleId}`}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to module
      </Link>
      <h1 className="text-2xl font-bold text-slate-800">Edit lesson</h1>
      <ContentEditForm
        contentId={contentId}
        moduleId={moduleId}
        initialTitle={content.title}
        initialSortOrder={content.sort_order}
      />
    </div>
  );
}
