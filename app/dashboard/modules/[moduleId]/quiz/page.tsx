import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStaffOrRedirect } from "@/lib/auth/get-session";
import { getModuleForStaff } from "@/services/module-service";
import { getQuizByModuleId, getQuizWithQuestions } from "@/services/quiz-service";
import { QuizForm } from "@/components/quiz/QuizForm";
import { submitQuizAction } from "@/app/actions/quiz";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  await requireStaffOrRedirect();

  const [module, quiz] = await Promise.all([
    getModuleForStaff(moduleId),
    getQuizByModuleId(moduleId),
  ]);

  if (!module) notFound();
  const quizWithQuestions = quiz ? await getQuizWithQuestions(quiz.id) : null;
  if (!quizWithQuestions) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/modules/${moduleId}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to module
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-800">{quizWithQuestions.title}</h1>
      {quizWithQuestions.description && (
        <p className="text-slate-600">{quizWithQuestions.description}</p>
      )}
      <p className="text-sm text-slate-500">
        Passing score: {quizWithQuestions.passing_score_percent}%
      </p>
      <QuizForm
        quiz={quizWithQuestions}
        moduleId={moduleId}
        submitAction={submitQuizAction}
      />
    </div>
  );
}
