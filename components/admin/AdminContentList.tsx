import Link from "next/link";
import type { ModuleContent } from "@/types/database";

interface AdminContentListProps {
  moduleId: string;
  content: ModuleContent[];
}

const contentTypeLabel: Record<ModuleContent["content_type"], string> = {
  video: "Video",
  pdf: "PDF",
  presentation: "Presentation",
};

export function AdminContentList({ moduleId, content }: AdminContentListProps) {
  if (content.length === 0) {
    return (
      <p className="text-slate-600 text-sm">No content yet. Add video, PDF, or presentation.</p>
    );
  }
  return (
    <ul className="space-y-2">
      {content.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
        >
          <div>
            <span className="font-medium text-slate-800">{item.title}</span>
            <span className="ml-2 text-sm text-slate-500">
              {contentTypeLabel[item.content_type]}
            </span>
          </div>
          <Link
            href={`/admin/modules/${moduleId}/content/${item.id}/edit`}
            className="text-sm text-primary-600 hover:underline"
          >
            Edit
          </Link>
        </li>
      ))}
    </ul>
  );
}
