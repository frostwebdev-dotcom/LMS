import type { ContentType } from "@/types/database";

interface ContentTypeBadgeProps {
  type: ContentType;
  className?: string;
}

const labels: Record<ContentType, string> = {
  video: "Video",
  pdf: "PDF",
  image: "Image",
  text: "Text",
  csv: "CSV",
};

export function ContentTypeBadge({ type, className = "" }: ContentTypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ${className}`}
    >
      {labels[type]}
    </span>
  );
}
