"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { QuizWithQuestions } from "@/services/quiz-service";
import type { submitQuizAction } from "@/app/actions/quiz";

interface QuizFormProps {
  quiz: QuizWithQuestions;
  moduleId: string;
  submitAction: typeof submitQuizAction;
}

export function QuizForm({ quiz, moduleId, submitAction }: QuizFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(submitAction, null);

  if (state?.success) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-800">Quiz complete</h2>
        <p className="mt-2 text-slate-600">
          Score: {state.scorePercent}%
          {state.passed ? " — Passed." : " — Not passed. You can retake the quiz."}
        </p>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/modules/${moduleId}`)}
          className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
        >
          Back to module
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="quiz_id" value={quiz.id} />
      <input type="hidden" name="answers" value="" id="quiz-answers-hidden" />
      {state?.success === false && state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
          {state.error}
        </div>
      )}
      {quiz.questions.map((q, qIndex) => (
        <fieldset key={q.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <legend className="font-medium text-slate-800">
            {qIndex + 1}. {q.question_text}
          </legend>
          <div className="mt-2 space-y-2">
            {q.options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  value={opt.id}
                  data-question-id={q.id}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-slate-700">{opt.option_text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button
        type="submit"
        disabled={isPending}
        onClick={(e) => {
          const form = (e.target as HTMLButtonElement).form;
          if (!form) return;
          const answers: { question_id: string; option_id: string }[] = [];
          quiz.questions.forEach((q) => {
            const selected = form.querySelector(`input[name="q_${q.id}"]:checked`) as HTMLInputElement | null;
            if (selected?.value) {
              answers.push({ question_id: q.id, option_id: selected.value });
            }
          });
          const hidden = document.getElementById("quiz-answers-hidden") as HTMLInputElement | null;
          if (hidden) hidden.value = JSON.stringify(answers);
        }}
        className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Submit quiz"}
      </button>
    </form>
  );
}
