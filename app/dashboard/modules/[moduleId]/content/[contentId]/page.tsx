import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/get-session";
import { getModuleForStaff } from "@/services/module-service";
import { getContentById, getContentByModuleId, getSignedUrl } from "@/services/content-service";
import { markContentComplete } from "@/services/progress-service";
import { ContentViewer } from "@/components/content/ContentViewer";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ moduleId: string; contentId: string }>;
}) {
  const { moduleId, contentId } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const [module, content, allContent] = await Promise.all([
    getModuleForStaff(moduleId),
    getContentById(contentId),
    getContentByModuleId(moduleId),
  ]);

  if (!module || !content || content.module_id !== module.id) notFound();

  let signedUrl: string;
  try {
    signedUrl = await getSignedUrl(content.storage_path);
  } catch {
    signedUrl = "";
  }

  const currentIndex = allContent.findIndex((c) => c.id === contentId);
  const nextContent = currentIndex >= 0 && currentIndex < allContent.length - 1
    ? allContent[currentIndex + 1]
    : null;
  const prevContent = currentIndex > 0 ? allContent[currentIndex - 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/modules/${moduleId}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to module
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-800">{content.title}</h1>
      <ContentViewer
        contentType={content.content_type}
        signedUrl={signedUrl}
        contentId={contentId}
        moduleId={moduleId}
        markCompleteAction={markContentComplete.bind(null, user.id, contentId)}
        prevHref={prevContent ? `/dashboard/modules/${moduleId}/content/${prevContent.id}` : null}
        nextHref={nextContent ? `/dashboard/modules/${moduleId}/content/${nextContent.id}` : null}
      />
    </div>
  );
}
