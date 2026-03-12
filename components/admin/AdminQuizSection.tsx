import Link from "next/link";
import type { Quiz } from "@/types/database";

interface AdminQuizSectionProps {
  moduleId: string;
  quiz: Quiz | null;
}

export function AdminQuizSection({ moduleId, quiz }: AdminQuizSectionProps) {
  if (!quiz) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-slate-600 text-sm mb-2">No quiz for this module.</p>
        <Link
          href={`/admin/modules/${moduleId}/quiz/new`}
          className="text-sm text-primary-600 hover:underline"
        >
          Create quiz
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-slate-800">{quiz.title}</span>
          <span className="ml-2 text-sm text-slate-500">
            Pass: {quiz.passing_score_percent}%
          </span>
        </div>
        <Link
          href={`/admin/modules/${moduleId}/quiz/edit`}
          className="text-sm text-primary-600 hover:underline"
        >
          Edit quiz
        </Link>
      </div>
    </div>
  );
}
