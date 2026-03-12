import { createClient } from "@/lib/supabase/server";

export interface QuizResult {
  scorePercent: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
}

/**
 * Calculate quiz score and persist attempt. Call from server action with validated input.
 */
export async function submitQuizAndGetResult(
  userId: string,
  quizId: string,
  answers: { question_id: string; option_id: string }[]
): Promise<QuizResult> {
  const supabase = await createClient();

  const { data: options, error: optError } = await supabase
    .from("quiz_answers")
    .select("id, question_id, is_correct")
    .in("question_id", answers.map((a) => a.question_id));

  if (optError) throw new Error(optError.message);

  const correctSet = new Set(
    (options ?? [])
      .filter((o) => o.is_correct)
      .map((o) => o.id)
  );

  let correctCount = 0;
  const answerMap = new Map(answers.map((a) => [a.question_id, a.option_id]));
  for (const o of options ?? []) {
    const chosen = answerMap.get(o.question_id);
    if (chosen === o.id && o.is_correct) correctCount++;
  }

  const totalQuestions = new Set(options?.map((o) => o.question_id) ?? []).size;
  const scorePercent =
    totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("passing_score_percent")
    .eq("id", quizId)
    .single();
  if (quizError || !quiz) throw new Error("Quiz not found");
  const passed = scorePercent >= (quiz.passing_score_percent ?? 80);

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      quiz_id: quizId,
      score_percent: scorePercent,
      passed,
    })
    .select("id")
    .single();
  if (attemptError) throw new Error(attemptError.message);

  for (const a of answers) {
    await supabase.from("quiz_attempt_answers").insert({
      attempt_id: attempt.id,
      question_id: a.question_id,
      answer_id: a.option_id,
    });
  }

  return {
    scorePercent,
    passed,
    totalQuestions,
    correctCount,
  };
}

export async function markContentComplete(userId: string, contentId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("user_lesson_progress").upsert(
    {
      user_id: userId,
      lesson_id: contentId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );
  if (error) throw new Error(error.message);
}

export async function markModuleComplete(userId: string, moduleId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("user_module_progress").upsert(
    {
      user_id: userId,
      module_id: moduleId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,module_id" }
  );
  if (error) throw new Error(error.message);
}

export async function getContentProgressSet(
  userId: string,
  contentIds: string[]
): Promise<Set<string>> {
  if (contentIds.length === 0) return new Set();
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .in("lesson_id", contentIds);
  return new Set((data ?? []).map((r) => r.lesson_id));
}

export async function getModuleProgressCompletedAt(
  userId: string,
  moduleId: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_module_progress")
    .select("completed_at")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .single();
  return data?.completed_at ?? null;
}

export async function getQuizBestAttempt(
  userId: string,
  quizId: string
): Promise<{ score_percent: number; passed: boolean } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select("score_percent, passed")
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .order("score_percent", { ascending: false })
    .limit(1)
    .single();
  return data;
}
