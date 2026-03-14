import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/get-session";
import { getModuleForStaff } from "@/services/module-service";
import { getContentById, getContentByModuleId, getSignedUrl } from "@/services/content-service";
import { ContentViewer } from "@/components/content/ContentViewer";

export default async function LessonViewerPage({
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

  const isMedia =
    content.content_type === "video" ||
    content.content_type === "pdf" ||
    content.content_type === "image";
  const storagePath =
    content.storage_path && String(content.storage_path).trim();
  let signedUrl = "";
  if (isMedia && storagePath) {
    try {
      signedUrl = await getSignedUrl(storagePath);
    } catch {
      signedUrl = "";
    }
  }

  const currentIndex = allContent.findIndex((c) => c.id === contentId);
  const nextContent =
    currentIndex >= 0 && currentIndex < allContent.length - 1
      ? allContent[currentIndex + 1]
      : null;
  const prevContent = currentIndex > 0 ? allContent[currentIndex - 1] : null;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-700"
        >
          Dashboard
        </Link>
        <span className="text-slate-400">/</span>
        <Link
          href={`/dashboard/modules/${moduleId}`}
          className="text-slate-500 hover:text-slate-700"
        >
          {module.title}
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-700 font-medium truncate max-w-[180px] sm:max-w-none">
          {content.title}
        </span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        {content.title}
      </h1>
      <ContentViewer
        contentType={content.content_type}
        signedUrl={signedUrl}
        contentText={content.content_text ?? null}
        contentId={contentId}
        moduleId={moduleId}
        prevHref={
          prevContent
            ? `/dashboard/modules/${moduleId}/content/${prevContent.id}`
            : null
        }
        nextHref={
          nextContent
            ? `/dashboard/modules/${moduleId}/content/${nextContent.id}`
            : null
        }
      />
    </div>
  );
}
