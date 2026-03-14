import { notFound } from "next/navigation";
import Link from "next/link";
import { getModuleById } from "@/services/module-service";
import { ContentUploadForm } from "@/components/admin/ContentUploadForm";

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
      <h1 className="text-2xl font-bold text-slate-800">Add lesson</h1>
      <p className="text-slate-600">Upload a video, PDF, or image. Order determines display order in the module.</p>
      <ContentUploadForm moduleId={moduleId} />
    </div>
  );
}
