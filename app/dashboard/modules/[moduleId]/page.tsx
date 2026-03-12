import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/get-session";
import { getModuleForStaff } from "@/services/module-service";
import { getContentByModuleId } from "@/services/content-service";
import { getQuizByModuleId } from "@/services/quiz-service";
import { getContentProgressSet, getQuizBestAttempt } from "@/services/progress-service";
import type { ContentType } from "@/types/database";

export default async function ModulePage({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to modules
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{module.title}</h1>
        {module.description && (
          <p className="mt-2 text-slate-600">{module.description}</p>
        )}
      </div>

      {content.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Content</h2>
          <ul className="space-y-2">
            {content.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/dashboard/modules/${moduleId}/content/${item.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">{item.title}</span>
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <ContentTypeBadge type={item.content_type} />
                    {completedContent.has(item.id) && (
                      <span className="text-green-600">Done</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {quiz && (
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Quiz</h2>
          <Link
            href={`/dashboard/modules/${moduleId}/quiz`}
            className="block rounded-lg border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
          >
            <span className="font-medium text-slate-800">{quiz.title}</span>
            {quizAttempt && (
              <span className="ml-2 text-sm text-slate-500">
                Best: {quizAttempt.score_percent}%
                {quizAttempt.passed ? " (passed)" : " (not passed)"}
              </span>
            )}
          </Link>
        </section>
      )}

      {content.length === 0 && !quiz && (
        <p className="text-slate-600">No content or quiz in this module yet.</p>
      )}
    </div>
  );
}

function ContentTypeBadge({ type }: { type: ContentType }) {
  const labels: Record<ContentType, string> = {
    video: "Video",
    pdf: "PDF",
    presentation: "Presentation",
  };
  return (
    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
      {labels[type]}
    </span>
  );
}
