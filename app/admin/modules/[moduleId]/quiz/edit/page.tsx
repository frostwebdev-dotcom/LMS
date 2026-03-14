import { notFound } from "next/navigation";
import Link from "next/link";
import { getModuleById } from "@/services/module-service";
import { getQuizByModuleId, getQuizWithQuestions } from "@/services/quiz-service";
import {
  updateQuizAction,
  addQuestionAction,
  addOptionAction,
  updateQuestionAction,
  updateOptionAction,
  deleteQuestionActionForm,
  deleteOptionActionForm,
} from "@/app/actions/quiz-admin";
import { QuizEditor } from "@/components/admin/QuizEditor";

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/modules/${moduleId}`} className="text-sm text-slate-600 hover:text-slate-900">
          ← Back to module
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-800">Edit quiz</h1>

      <QuizEditor
        quiz={quizWithQuestions}
        moduleId={moduleId}
        updateQuizAction={updateQuizAction}
        addQuestionAction={addQuestionAction}
        addOptionAction={addOptionAction}
        updateQuestionAction={updateQuestionAction}
        updateOptionAction={updateOptionAction}
        deleteQuestionActionForm={deleteQuestionActionForm}
        deleteOptionActionForm={deleteOptionActionForm}
      />
    </div>
  );
}
