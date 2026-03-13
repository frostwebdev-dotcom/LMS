import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/get-session";
import { getModuleForStaff } from "@/services/module-service";
import { getContentByModuleId } from "@/services/content-service";
import { getQuizByModuleId } from "@/services/quiz-service";
import { getContentProgressSet, getQuizBestAttempt } from "@/services/progress-service";
import { LessonList } from "@/components/content/LessonList";
import type { ModuleContent } from "@/types/database";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const user = await getSessionUser();
  if (!user) notFound();

  const [module, content, quiz] = await Promise.all([
    getModuleForStaff(moduleId),
    getContentByModuleId(moduleId),
    getQuizByModuleId(moduleId),
  ]);

  if (!module) notFound();

  const contentIds = content.map((c) => c.id);
  const completedContent = await getContentProgressSet(user.id, contentIds);
  const quizAttempt = quiz
    ? await getQuizBestAttempt(user.id, quiz.id)
    : null;

  const lessonsWithState = content.map((item) => ({
    ...item,
    completed: completedContent.has(item.id),
  }));

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">
          Dashboard
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-medium text-slate-900">{module.title}</span>
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {module.title}
        </h1>
        {module.description && (
          <p className="mt-2 text-slate-600">{module.description}</p>
        )}
      </header>

      <section aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="text-lg font-semibold text-slate-900 mb-4">
          Lessons
        </h2>
        <LessonList moduleId={moduleId} lessons={lessonsWithState} />
      </section>

      {quiz && (
        <section aria-labelledby="quiz-heading">
          <h2 id="quiz-heading" className="text-lg font-semibold text-slate-900 mb-4">
            Quiz
          </h2>
          <Link
            href={`/dashboard/modules/${moduleId}/quiz`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-primary-200 hover:bg-slate-50 sm:px-5"
          >
            <span className="font-medium text-slate-900">{quiz.title}</span>
            {quizAttempt ? (
              <span className="text-sm text-slate-600">
                Best: {quizAttempt.score_percent}%
                {quizAttempt.passed ? " (passed)" : " (not passed)"}
              </span>
            ) : (
              <span className="text-sm text-slate-500">Not attempted</span>
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
