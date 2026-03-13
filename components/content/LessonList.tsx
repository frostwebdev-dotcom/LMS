import Link from "next/link";
import type { ModuleContent } from "@/types/database";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { LessonViewStateBadge } from "./LessonViewStateBadge";

export interface LessonWithState extends ModuleContent {
  completed: boolean;
}

interface LessonListProps {
  moduleId: string;
  lessons: LessonWithState[];
  /** Accessible section heading id */
  headingId?: string;
}

export function LessonList({ moduleId, lessons, headingId = "lessons-heading" }: LessonListProps) {
  if (lessons.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
        No lessons in this module yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2" aria-labelledby={headingId}>
      {lessons.map((lesson, index) => (
        <li key={lesson.id}>
          <Link
            href={`/dashboard/modules/${moduleId}/content/${lesson.id}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-primary-200 hover:bg-slate-50 sm:px-5"
          >
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                {index + 1}
              </span>
              <span className="truncate font-medium text-slate-900">
                {lesson.title}
              </span>
              <ContentTypeBadge type={lesson.content_type} />
            </span>
            <LessonViewStateBadge
              state={lesson.completed ? "complete" : "not_started"}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
