import Link from "next/link";
import { DeleteLessonButton } from "@/components/admin/DeleteLessonButton";
import type { ModuleContent } from "@/types/database";

interface AdminContentListProps {
  moduleId: string;
  content: ModuleContent[];
}

const contentTypeLabel: Record<ModuleContent["content_type"], string> = {
  video: "Video",
  pdf: "PDF",
  image: "Image",
  text: "Text",
  csv: "CSV",
};

export function AdminContentList({ moduleId, content }: AdminContentListProps) {
  if (content.length === 0) {
    return (
      <p className="text-slate-600 text-sm">No lessons yet. Add video, PDF, image, or CSV.</p>
    );
  }
  return (
    <ul className="space-y-2">
      {content.map((item, index) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:px-5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
              {index + 1}
            </span>
            <span className="font-medium text-slate-800">{item.title}</span>
            <span className="text-sm text-slate-500">
              {contentTypeLabel[item.content_type]} · Order {item.sort_order}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/modules/${moduleId}/content/${item.id}/edit`}
              className="text-sm font-medium text-primary-600 hover:underline"
            >
              Edit
            </Link>
            <DeleteLessonButton
              contentId={item.id}
              moduleId={moduleId}
              lessonTitle={item.title}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
