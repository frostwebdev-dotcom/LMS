"use client";

import type { QuizWithQuestions } from "@/types/quiz";
import { EditQuizForm } from "@/components/admin/EditQuizForm";
import { AddQuestionForm } from "@/components/admin/AddQuestionForm";
import { AddOptionForm } from "@/components/admin/AddOptionForm";
import { EditQuestionForm } from "@/components/admin/EditQuestionForm";
import { EditOptionForm } from "@/components/admin/EditOptionForm";
import { DeleteQuestionForm } from "@/components/admin/DeleteQuestionForm";
import { DeleteOptionForm } from "@/components/admin/DeleteOptionForm";
import type { QuizAdminResult } from "@/components/admin/EditQuizForm";

interface QuizEditorProps {
  quiz: QuizWithQuestions;
  moduleId: string;
  updateQuizAction: (
    quizId: string,
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<QuizAdminResult>;
  addQuestionAction: (
    quizId: string,
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<QuizAdminResult>;
  addOptionAction: (
    questionId: string,
    quizId: string,
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<QuizAdminResult>;
  updateQuestionAction: (
    questionId: string,
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<QuizAdminResult>;
  updateOptionAction: (
    optionId: string,
    moduleId: string,
    prev: unknown,
    formData: FormData
  ) => Promise<QuizAdminResult>;
  deleteQuestionActionForm: (formData: FormData) => Promise<QuizAdminResult>;
  deleteOptionActionForm: (formData: FormData) => Promise<QuizAdminResult>;
}

/**
 * Modular quiz editor: quiz settings, add question, and list of questions with options.
 * Keeps all quiz-editor UI and action wiring in one place; no mock data.
 */
export function QuizEditor({
  quiz,
  moduleId,
  updateQuizAction,
  addQuestionAction,
  addOptionAction,
  updateQuestionAction,
  updateOptionAction,
  deleteQuestionActionForm,
  deleteOptionActionForm,
}: QuizEditorProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <EditQuizForm
          quizId={quiz.id}
          moduleId={moduleId}
          initialTitle={quiz.title}
          initialDescription={quiz.description ?? null}
          initialPassingScorePercent={quiz.passing_score_percent}
          action={updateQuizAction}
        />
      </section>

      <section aria-labelledby="add-question-heading">
        <h2 id="add-question-heading" className="text-lg font-semibold text-slate-800 mb-3">
          Add question
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <AddQuestionForm
            quizId={quiz.id}
            moduleId={moduleId}
            action={addQuestionAction}
          />
        </div>
      </section>

      <section aria-labelledby="questions-heading">
        <h2 id="questions-heading" className="text-lg font-semibold text-slate-800 mb-3">
          Questions
        </h2>
        {quiz.questions.length === 0 ? (
          <p className="text-slate-600 text-sm">No questions yet. Add one above.</p>
        ) : (
          <ul className="space-y-4" role="list">
            {quiz.questions.map((q, idx) => (
              <li
                key={q.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
                data-question-index={idx + 1}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-medium text-slate-800">
                    Question {idx + 1}
                  </p>
                  <DeleteQuestionForm
                    questionId={q.id}
                    moduleId={moduleId}
                    questionNumber={idx + 1}
                    action={deleteQuestionActionForm}
                  />
                </div>
                <EditQuestionForm
                  questionId={q.id}
                  moduleId={moduleId}
                  initialQuestionText={q.question_text}
                  initialSortOrder={q.sort_order}
                  action={updateQuestionAction}
                />
                <p className="mt-3 text-sm font-medium text-slate-700">Answer options</p>
                <ul className="mt-1 space-y-1" role="list">
                  {q.options.map((opt) => (
                    <li
                      key={opt.id}
                      className="flex flex-wrap items-center gap-2 rounded border border-slate-100 bg-slate-50/50 px-2 py-1"
                    >
                      <EditOptionForm
                        optionId={opt.id}
                        moduleId={moduleId}
                        initialOptionText={opt.option_text}
                        initialIsCorrect={opt.is_correct}
                        initialSortOrder={opt.sort_order}
                        action={updateOptionAction}
                      />
                      <DeleteOptionForm
                        optionId={opt.id}
                        moduleId={moduleId}
                        action={deleteOptionActionForm}
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
