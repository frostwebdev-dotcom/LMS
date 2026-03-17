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
import { getModuleCompletionState } from "@/services/module-completion-service";
import { CompleteTrainingBlock } from "@/components/dashboard/CompleteTrainingBlock";
import { formatModuleCompletedAt, formatExpirationDate } from "@/lib/format-completion-date";
import { computeExpiration } from "@/lib/expiration";
import { ExpirationBadge } from "@/components/dashboard/ExpirationBadge";
import { LessonList } from "@/components/content/LessonList";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
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
  const [completedContent, quizAttempt, progressCompletedAt, completionState] = await Promise.all([
    getContentProgressSet(user.id, contentIds),
    quiz ? getQuizBestAttempt(user.id, quiz.id) : Promise.resolve(null),
    getModuleProgressCompletedAt(user.id, moduleId),
    getModuleCompletionState(user.id, moduleId),
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
  const status: ModuleProgressStatus = progressCompletedAt
    ? "completed"
    : progressPercent > 0
      ? "in_progress"
      : "not_started";

  const expiration = computeExpiration(progressCompletedAt, module.expiration_months);

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

      <Accordion>
        <AccordionItem title="Your progress" defaultExpanded id="module-progress">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="text-sm font-medium text-primary-700">Progress</span>
            <StatusBadge status={status} />
          </div>
          <ProgressBar
            value={progressPercent}
            label={`${progressPercent}% complete`}
            aria-label={`Module progress: ${progressPercent}%`}
          />
          {status === "completed" && progressCompletedAt && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-primary-700" title={progressCompletedAt}>
                Completed on {formatModuleCompletedAt(progressCompletedAt)}
              </p>
              {expiration && (
                <>
                  <p className="text-sm text-primary-700">
                    {expiration.status === "expired"
                      ? `Expired ${formatExpirationDate(expiration.expiresAt)}`
                      : `Expires ${formatExpirationDate(expiration.expiresAt)}`}
                    {" · "}
                    <span className="font-medium">{expiration.daysRemaining >= 0 ? `${expiration.daysRemaining} days remaining` : `Expired ${Math.abs(expiration.daysRemaining)} days ago`}</span>
                  </p>
                  <ExpirationBadge status={expiration.status} daysRemaining={expiration.daysRemaining} />
                </>
              )}
            </div>
          )}
        </AccordionItem>

        <AccordionItem title="Lessons" defaultExpanded id="lessons">
          <LessonList moduleId={moduleId} lessons={lessonsWithState} headingId="lessons-trigger" />
        </AccordionItem>

        {quiz && (
          <AccordionItem title="Quiz" defaultExpanded id="quiz">
            <Link
              href={`/dashboard/modules/${moduleId}/quiz`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary-200 bg-white px-4 py-3 transition hover:border-primary-300 hover:bg-primary-50/50 sm:px-5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span className="font-medium text-primary-900">{quiz.title}</span>
              {quizAttempt ? (
                <span className="text-sm text-primary-600 shrink-0">
                  <strong>{quizAttempt.score_percent}%</strong>
                  {quizAttempt.passed ? (
                    <span className="text-emerald-700"> — Passed</span>
                  ) : (
                    <span className="text-accent-700"> — Not passed</span>
                  )}
                </span>
              ) : (
                <span className="text-sm text-primary-500 shrink-0">Not attempted</span>
              )}
            </Link>
          </AccordionItem>
        )}
      </Accordion>

      {/* Complete Training: only after all lessons viewed + quiz passed */}
      {content.length > 0 && (
        <CompleteTrainingBlock
          moduleId={moduleId}
          moduleTitle={module.title}
          allLessonsViewed={completionState.allLessonsCompleted}
          hasQuiz={completionState.hasQuiz}
          quizPassed={completionState.quizPassed}
          alreadyCompleted={!!progressCompletedAt}
        />
      )}

      {content.length === 0 && !quiz && (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
          No content or quiz in this module yet.
        </p>
      )}
    </div>
  );
}
