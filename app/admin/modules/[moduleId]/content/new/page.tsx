import { notFound } from "next/navigation";
import Link from "next/link";
import { getModuleById } from "@/services/module-service";
import { ContentUploadForm } from "@/components/admin/ContentUploadForm";
import { uploadContentAction } from "@/app/actions/content";

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const trainingModule = await getModuleById(moduleId);
  if (!trainingModule) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/modules/${moduleId}`}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to module
      </Link>
      <h1 className="text-2xl font-bold text-slate-800">Add content</h1>
      <ContentUploadForm moduleId={moduleId} action={uploadContentAction} />
    </div>
  );
}
