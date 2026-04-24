import { createClient } from "@/lib/supabase/server";
import { issueCertificateAfterModuleCompletion } from "@/services/certificate-service";
import { submitQuiz } from "@/services/quiz-submission-service";
import type { QuizSubmitResult } from "@/types/quiz";

export type { QuizSubmitResult } from "@/types/quiz";

/**
 * Calculate quiz score and persist attempt. Delegates to quiz-submission-service.
 */
export async function submitQuizAndGetResult(
  userId: string,
  quizId: string,
  answers: { question_id: string; option_id: string }[]
): Promise<QuizSubmitResult> {
  return submitQuiz(userId, { quiz_id: quizId, answers });
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

/**
 * Marks module training complete for the user. Preserves the first `completed_at` if the row
 * already exists (e.g. auto-completion ran first). Always attempts certificate issuance afterward
 * (idempotent; safe if a certificate row already exists).
 */
export async function markModuleComplete(userId: string, moduleId: string): Promise<void> {
  const supabase = await createClient();
  const { data: existing, error: loadErr } = await supabase
    .from("user_module_progress")
    .select("completed_at")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (loadErr) throw new Error(loadErr.message);

  const completedAt = (existing as { completed_at: string | null } | null)?.completed_at;

  if (!completedAt) {
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

  try {
    await issueCertificateAfterModuleCompletion(supabase, userId, moduleId);
  } catch (e) {
    console.error("[certificates] issue after completion:", e);
  }
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
    .maybeSingle();
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
    .maybeSingle();
  return data;
}
