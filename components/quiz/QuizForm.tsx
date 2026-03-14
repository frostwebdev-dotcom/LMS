"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { QuizWithQuestions } from "@/services/quiz-service";
import type { submitQuizAction } from "@/app/actions/quiz";

interface QuizFormProps {
  quiz: QuizWithQuestions;
  moduleId: string;
  submitAction: typeof submitQuizAction;
}

export function QuizForm({ quiz, moduleId, submitAction }: QuizFormProps) {
  const [state, formAction, isPending] = useActionState(submitAction, null);

  if (state?.success) {
    return (
      <div
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">
          Quiz complete
        </h2>
        <div
          className={`mt-4 rounded-lg border p-4 ${
            state.passed
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="text-slate-800">
            <span className="font-medium">Score: {state.scorePercent}%</span>
            {state.passed ? (
              <span className="mt-1 block text-emerald-700">Passed.</span>
            ) : (
              <span className="mt-1 block text-amber-800">
                Not passed. You can retake the quiz.
              </span>
            )}
          </p>
        </div>
        <Link
          href={`/dashboard/modules/${moduleId}`}
          className="mt-6 inline-block rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Back to module
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="quiz_id" value={quiz.id} />
      <input type="hidden" name="answers" value="" id="quiz-answers-hidden" />
      {state?.success === false && state?.error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </div>
      )}
      <p className="text-sm text-slate-500">
        Select one answer per question, then submit. Passing score is{" "}
        {quiz.passing_score_percent}%.
      </p>
      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => (
          <fieldset
            key={q.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <legend className="text-base font-medium text-slate-800 sm:text-lg">
              {qIndex + 1}. {q.question_text}
            </legend>
            <div className="mt-3 space-y-2 sm:mt-4">
              {q.options.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:border-slate-200 hover:bg-slate-50 has-[:checked]:border-primary-300 has-[:checked]:bg-primary-50/50"
                >
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value={opt.id}
                    data-question-id={q.id}
                    className="mt-0.5 shrink-0 rounded-full border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label={`Option: ${opt.option_text.slice(0, 60)}${opt.option_text.length > 60 ? "…" : ""}`}
                  />
                  <span className="text-slate-700">{opt.option_text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={isPending}
          onClick={(e) => {
            const form = (e.target as HTMLButtonElement).form;
            if (!form) return;
            const answers: { question_id: string; option_id: string }[] = [];
            quiz.questions.forEach((q) => {
              const selected = form.querySelector(
                `input[name="q_${q.id}"]:checked`
              ) as HTMLInputElement | null;
              if (selected?.value) {
                answers.push({ question_id: q.id, option_id: selected.value });
              }
            });
            const hidden = document.getElementById(
              "quiz-answers-hidden"
            ) as HTMLInputElement | null;
            if (hidden) hidden.value = JSON.stringify(answers);
          }}
          className="rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isPending ? "Submitting…" : "Submit quiz"}
        </button>
        <Link
          href={`/dashboard/modules/${moduleId}`}
          className="text-sm text-slate-600 underline hover:text-slate-900"
        >
          Cancel and return to module
        </Link>
      </div>
    </form>
  );
}
