import { notFound } from "next/navigation";
import Link from "next/link";
import { isStaff, requireUserOrRedirect } from "@/lib/auth/get-session";
import { getModuleForStaff } from "@/services/module-service";
import { createContentViewToken } from "@/lib/content-view-token";
import { getContentById, getContentByModuleId } from "@/services/content-service";
import { ContentViewer } from "@/components/content/ContentViewer";
import { RecordLessonView } from "@/components/content/RecordLessonView";

export default async function LessonViewerPage({
  params,
}: {
  params: Promise<{ moduleId: string; contentId: string }>;
}) {
  const { moduleId, contentId } = await params;
  const user = await requireUserOrRedirect();

  const [module, content, allContent] = await Promise.all([
    getModuleForStaff(moduleId),
    getContentById(contentId),
    getContentByModuleId(moduleId),
  ]);

  if (!module || !content || content.module_id !== module.id) notFound();

  const isFile =
    content.content_type === "video" ||
    content.content_type === "pdf" ||
    content.content_type === "image" ||
    content.content_type === "csv";
  const storagePath =
    content.storage_path && String(content.storage_path).trim();
  /** Same-origin proxy with inline disposition — avoids mobile “download PDF” behavior and hides raw storage URLs. */
  const mediaViewUrl =
    isFile && storagePath
      ? `/api/content/view/${contentId}?t=${encodeURIComponent(createContentViewToken(contentId))}`
      : "";

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
      <RecordLessonView contentId={contentId} />
      <ContentViewer
        contentType={content.content_type}
        mediaViewUrl={mediaViewUrl}
        contentText={content.content_text ?? null}
        contentId={contentId}
        moduleId={moduleId}
        restrictPdfBrowserChrome={isStaff(user)}
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
