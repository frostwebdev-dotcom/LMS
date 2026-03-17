import { createClient } from "@/lib/supabase/server";
import type { SubmitQuizInput, QuizSubmitResult } from "@/types/quiz";

/**
 * Validates answers against quiz_answers, computes score, persists attempt and attempt_answers.
 * Uses answer_id in quiz_attempt_answers (FK to quiz_answers.id).
 */
export async function submitQuiz(
  userId: string,
  input: SubmitQuizInput
): Promise<QuizSubmitResult> {
  const supabase = await createClient();
  const { quiz_id, answers } = input;

  const { data: options, error: optError } = await supabase
    .from("quiz_answers")
    .select("id, question_id, is_correct")
    .in("question_id", answers.map((a) => a.question_id));

  if (optError) throw new Error(optError.message);

  const correctSet = new Set((options ?? []).filter((o) => o.is_correct).map((o) => o.id));
  const answerMap = new Map(answers.map((a) => [a.question_id, a.option_id]));

  let correctCount = 0;
  for (const o of options ?? []) {
    const chosen = answerMap.get(o.question_id);
    if (chosen === o.id && o.is_correct) correctCount++;
  }

  const totalQuestions = new Set(options?.map((o) => o.question_id) ?? []).size;
  const scorePercent =
    totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("passing_score_percent, module_id")
    .eq("id", quiz_id)
    .single();
  if (quizError || !quiz) throw new Error("Quiz not found");
  const passed = scorePercent >= (quiz.passing_score_percent ?? 80);

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      quiz_id,
      score_percent: scorePercent,
      passed,
    })
    .select("id")
    .single();
  if (attemptError) throw new Error(attemptError.message);

  for (const a of answers) {
    const { error: ansError } = await supabase.from("quiz_attempt_answers").insert({
      attempt_id: attempt.id,
      question_id: a.question_id,
      answer_id: a.option_id,
    });
    if (ansError) throw new Error(ansError.message);
  }

  return {
    scorePercent,
    passed,
    totalQuestions,
    correctCount,
  };
}
