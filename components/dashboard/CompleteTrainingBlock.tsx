"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { completeModuleTrainingAction } from "@/app/actions/module-completion";
import type { CompleteModuleTrainingResult } from "@/app/actions/module-completion";

interface CompleteTrainingBlockProps {
  moduleId: string;
  moduleTitle: string;
  /** User has viewed all required lessons. */
  allLessonsViewed: boolean;
  /** Module has a quiz. */
  hasQuiz: boolean;
  /** User has passed the quiz (or there is no quiz). */
  quizPassed: boolean;
  /** User has already completed the module (clicked Complete Training). */
  alreadyCompleted: boolean;
}

export function CompleteTrainingBlock({
  moduleId,
  moduleTitle,
  allLessonsViewed,
  hasQuiz,
  quizPassed,
  alreadyCompleted,
}: CompleteTrainingBlockProps) {
  const router = useRouter();
  const [result, setResult] = useState<CompleteModuleTrainingResult | null>(null);
  const [isPending, setIsPending] = useState(false);

  const eligible = allLessonsViewed && quizPassed && !alreadyCompleted;

  async function handleComplete() {
    setResult(null);
    setIsPending(true);
    try {
      const res = await completeModuleTrainingAction(moduleId);
      setResult(res);
      if (res.success) router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  if (alreadyCompleted) return null;

  if (!allLessonsViewed) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        View all lessons to unlock the Complete Training button.
      </div>
    );
  }

  if (hasQuiz && !quizPassed) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Pass the quiz to unlock the Complete Training button.{" "}
        <Link
          href={`/dashboard/modules/${moduleId}/quiz`}
          className="font-medium text-primary-600 hover:text-primary-700 underline"
        >
          Take the quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50/50 px-4 py-4">
      <p className="text-sm font-medium text-primary-900 mb-2">
        You&apos;ve viewed all lessons{hasQuiz ? " and passed the quiz" : ""}. Complete this training to record your completion.
      </p>
      {result?.success === false && (
        <p className="text-sm text-red-600 mb-2" role="alert">
          {result.error}
        </p>
      )}
      <button
        type="button"
        onClick={handleComplete}
        disabled={isPending}
        className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? "Completing…" : "Complete Training"}
      </button>
    </div>
  );
}
