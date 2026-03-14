import { createClient } from "@/lib/supabase/server";

/**
 * Production-ready module completion rules (reusable).
 * A module is completed only when:
 * 1. All required lessons are viewed (completed),
 * 2. Quiz is passed (or module has no quiz).
 */

/** Required lesson IDs for a module (all lessons in the module). */
export async function getRequiredLessonIdsForModule(
  moduleId: string
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_lessons")
    .select("id")
    .eq("module_id", moduleId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.id);
}

/** Quiz id for a module, if any. */
export async function getQuizIdForModule(moduleId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("id")
    .eq("module_id", moduleId)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

export interface ModuleCompletionState {
  allLessonsCompleted: boolean;
  quizPassed: boolean;
  completedAt: string | null;
  requiredLessonIds: string[];
  completedLessonCount: number;
  hasQuiz: boolean;
}

/**
 * Returns current completion state for a user and module (no mock data).
 * Used by dashboard and by updateModuleCompletionIfEligible.
 */
export async function getModuleCompletionState(
  userId: string,
  moduleId: string
): Promise<ModuleCompletionState> {
  const supabase = await createClient();
  const requiredLessonIds = await getRequiredLessonIdsForModule(moduleId);

  const [quizId, completedAtRow, completedLessonRows] = await Promise.all([
    getQuizIdForModule(moduleId),
    supabase
      .from("user_module_progress")
      .select("completed_at")
      .eq("user_id", userId)
      .eq("module_id", moduleId)
      .maybeSingle(),
    requiredLessonIds.length === 0
      ? Promise.resolve([])
      : supabase
          .from("user_lesson_progress")
          .select("lesson_id")
          .eq("user_id", userId)
          .not("completed_at", "is", null)
          .in("lesson_id", requiredLessonIds)
          .then((r) => r.data ?? []),
  ]);

  const completedLessonIds = new Set(
    (completedLessonRows as { lesson_id: string }[]).map((r) => r.lesson_id)
  );
  const allLessonsCompleted =
    requiredLessonIds.length === 0 ||
    requiredLessonIds.every((id) => completedLessonIds.has(id));

  let quizPassed = true;
  if (quizId) {
    const { data: attempt } = await supabase
      .from("quiz_attempts")
      .select("passed")
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .eq("passed", true)
      .limit(1)
      .maybeSingle();
    quizPassed = !!attempt?.passed;
  }

  const completedAt = (completedAtRow.data as { completed_at: string | null } | null)?.completed_at ?? null;

  return {
    allLessonsCompleted,
    quizPassed,
    completedAt,
    requiredLessonIds,
    completedLessonCount: requiredLessonIds.filter((id) => completedLessonIds.has(id)).length,
    hasQuiz: !!quizId,
  };
}

/**
 * If the user has completed all required lessons and passed the quiz (or there is no quiz),
 * sets user_module_progress.completed_at to now. Idempotent; does not overwrite existing
 * completed_at (preserves first completion time).
 */
export async function updateModuleCompletionIfEligible(
  userId: string,
  moduleId: string
): Promise<void> {
  const state = await getModuleCompletionState(userId, moduleId);
  if (!state.allLessonsCompleted || !state.quizPassed) return;
  if (state.completedAt) return; // already marked complete

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("user_module_progress").upsert(
    {
      user_id: userId,
      module_id: moduleId,
      completed_at: now,
    },
    { onConflict: "user_id,module_id" }
  );
  if (error) throw new Error(error.message);
}
