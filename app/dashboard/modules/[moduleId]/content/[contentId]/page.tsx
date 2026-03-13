import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/get-session";
import { getModuleForStaff } from "@/services/module-service";
import { getContentById, getContentByModuleId, getSignedUrl } from "@/services/content-service";
import { createContentViewToken } from "@/lib/content-view-token";
import { ContentViewer } from "@/components/content/ContentViewer";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

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
    content.content_type === "presentation";
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

  // For presentations: try Google Docs viewer (often more reliable than Office with proxied URLs).
  // Staff can use the fallback link to open/download if the embed fails.
  const baseUrl = getBaseUrl();
  const viewToken = createContentViewToken(contentId);
  const proxyUrl =
    content.content_type === "presentation" && signedUrl
      ? `${baseUrl}/api/content/view/${contentId}?t=${viewToken}`
      : "";
  const presentationViewerUrl = proxyUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(proxyUrl)}&embedded=true`
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
      <ContentViewer
        contentType={content.content_type}
        signedUrl={signedUrl}
        presentationViewerUrl={presentationViewerUrl}
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
