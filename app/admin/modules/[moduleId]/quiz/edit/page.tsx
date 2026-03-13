import { notFound } from "next/navigation";
import Link from "next/link";
import { getModuleById } from "@/services/module-service";
import { getQuizByModuleId, getQuizWithQuestions } from "@/services/quiz-service";
import {
  addQuestionAction,
  addOptionAction,
  updateQuestionAction,
  updateOptionAction,
} from "@/app/actions/quiz-admin";
import { AddQuestionForm } from "@/components/admin/AddQuestionForm";
import { AddOptionForm } from "@/components/admin/AddOptionForm";
import { EditQuestionForm } from "@/components/admin/EditQuestionForm";
import { EditOptionForm } from "@/components/admin/EditOptionForm";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const trainingModule = await getModuleById(moduleId);
  if (!trainingModule) notFound();

  const quiz = await getQuizByModuleId(moduleId);
  if (!quiz) {
    return (
      <div className="space-y-6">
        <Link href={`/admin/modules/${moduleId}`} className="text-sm text-slate-600 hover:text-slate-900">
          ← Back to module
        </Link>
        <p className="text-slate-600">No quiz. Create one from the module page.</p>
      </div>
    );
  }

  const quizWithQuestions = await getQuizWithQuestions(quiz.id);
  if (!quizWithQuestions) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/admin/modules/${moduleId}`} className="text-sm text-slate-600 hover:text-slate-900">
          ← Back to module
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-800">Edit quiz: {quizWithQuestions.title}</h1>
      <p className="text-slate-600">Passing score: {quizWithQuestions.passing_score_percent}%</p>

      <AddQuestionForm quizId={quiz.id} moduleId={moduleId} action={addQuestionAction} />

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Questions</h2>
        {quizWithQuestions.questions.length === 0 ? (
          <p className="text-slate-600 text-sm">No questions yet.</p>
        ) : (
          <ul className="space-y-4">
            {quizWithQuestions.questions.map((q, idx) => (
              <li key={q.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-800">
                  {idx + 1}. Edit question
                </p>
                <EditQuestionForm
                  questionId={q.id}
                  moduleId={moduleId}
                  initialQuestionText={q.question_text}
                  initialSortOrder={q.sort_order}
                  action={updateQuestionAction}
                />
                <p className="mt-3 text-sm font-medium text-slate-700">Answer options</p>
                <ul className="mt-1 space-y-1">
                  {q.options.map((opt) => (
                    <li key={opt.id} className="rounded border border-slate-100 bg-slate-50/50 px-2">
                      <EditOptionForm
                        optionId={opt.id}
                        moduleId={moduleId}
                        initialOptionText={opt.option_text}
                        initialIsCorrect={opt.is_correct}
                        initialSortOrder={opt.sort_order}
                        action={updateOptionAction}
                      />
                    </li>
                  ))}
                </ul>
                <AddOptionForm
                  questionId={q.id}
                  quizId={quiz.id}
                  moduleId={moduleId}
                  action={addOptionAction}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
