import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/auth/get-session";
import { getModuleForStaff } from "@/services/module-service";
import { getContentByModuleId } from "@/services/content-service";
import { getQuizByModuleId } from "@/services/quiz-service";
import {
  getContentProgressSet,
  getQuizBestAttempt,
  getModuleProgressCompletedAt,
} from "@/services/progress-service";
import { LessonList } from "@/components/content/LessonList";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import type { ModuleContent } from "@/types/database";
import type { ModuleProgressStatus } from "@/types/dashboard";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const user = await requireUserOrRedirect();

  const [module, content, quiz] = await Promise.all([
    getModuleForStaff(moduleId),
    getContentByModuleId(moduleId),
    getQuizByModuleId(moduleId),
  ]);

  if (!module) notFound();

  const contentIds = content.map((c) => c.id);
  const [completedContent, quizAttempt, progressCompletedAt] = await Promise.all([
    getContentProgressSet(user.id, contentIds),
    quiz ? getQuizBestAttempt(user.id, quiz.id) : Promise.resolve(null),
    getModuleProgressCompletedAt(user.id, moduleId),
  ]);

  const lessonsWithState = content.map((item) => ({
    ...item,
    completed: completedContent.has(item.id),
  }));

  const totalSteps = content.length + (quiz ? 1 : 0);
  const completedSteps =
    contentIds.filter((id) => completedContent.has(id)).length +
    (quizAttempt?.passed ? 1 : 0);
  const progressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const status: ModuleProgressStatus =
    progressCompletedAt || progressPercent === 100
      ? "completed"
      : progressPercent > 0
        ? "in_progress"
        : "not_started";

  return (
    <div className="space-y-6 sm:space-y-8">
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">
          Dashboard
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-medium text-slate-900 truncate">{module.title}</span>
      </nav>

      <header>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          {module.title}
        </h1>
        {module.description && (
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            {module.description}
          </p>
        )}
      </header>

      <section
        aria-labelledby="module-progress-heading"
        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 id="module-progress-heading" className="text-sm font-semibold text-slate-700">
            Your progress
          </h2>
          <StatusBadge status={status} />
        </div>
        <ProgressBar
          value={progressPercent}
          label={`${progressPercent}% complete`}
          aria-label={`Module progress: ${progressPercent}%`}
        />
      </section>

      <section aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
          Lessons
        </h2>
        <LessonList moduleId={moduleId} lessons={lessonsWithState} />
      </section>

      {quiz && (
        <section aria-labelledby="quiz-heading">
          <h2 id="quiz-heading" className="text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
            Quiz
          </h2>
          <Link
            href={`/dashboard/modules/${moduleId}/quiz`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-primary-200 hover:bg-slate-50 sm:px-5"
          >
            <span className="font-medium text-slate-900">{quiz.title}</span>
            {quizAttempt ? (
              <span className="text-sm text-slate-600 shrink-0">
                <strong>{quizAttempt.score_percent}%</strong>
                {quizAttempt.passed ? (
                  <span className="text-emerald-700"> — Passed</span>
                ) : (
                  <span className="text-amber-700"> — Not passed</span>
                )}
              </span>
            ) : (
              <span className="text-sm text-slate-500 shrink-0">Not attempted</span>
            )}
          </Link>
        </section>
      )}

      {content.length === 0 && !quiz && (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
          No content or quiz in this module yet.
        </p>
      )}
    </div>
  );
}
