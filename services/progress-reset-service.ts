import { createClient } from "@/lib/supabase/server";
import {
  getRequiredLessonIdsForModule,
  getQuizIdForModule,
} from "@/services/module-completion-service";

/**
 * Resets all progress for a module for all users (e.g. for annual training reset).
 * Deletes: user_lesson_progress for all lessons in the module, user_module_progress
 * for the module, and quiz_attempts (and attempt_answers via CASCADE) for the module's quiz.
 * Caller must be admin (enforced by RLS).
 */
export async function resetModuleProgressForAllUsers(
  moduleId: string
): Promise<void> {
  const supabase = await createClient();
  const [lessonIds, quizId] = await Promise.all([
    getRequiredLessonIdsForModule(moduleId),
    getQuizIdForModule(moduleId),
  ]);

  if (lessonIds.length > 0) {
    const { error: lessonErr } = await supabase
      .from("user_lesson_progress")
      .delete()
      .in("lesson_id", lessonIds);
    if (lessonErr) throw new Error(lessonErr.message);
  }

  const { error: moduleErr } = await supabase
    .from("user_module_progress")
    .delete()
    .eq("module_id", moduleId);
  if (moduleErr) throw new Error(moduleErr.message);

  if (quizId) {
    const { error: quizErr } = await supabase
      .from("quiz_attempts")
      .delete()
      .eq("quiz_id", quizId);
    if (quizErr) throw new Error(quizErr.message);
  }
}

/**
 * Resets one user's progress for a single module. Use for correcting a single
 * staff member's record or letting them re-take the module.
 */
export async function resetUserModuleProgress(
  userId: string,
  moduleId: string
): Promise<void> {
  const supabase = await createClient();
  const [lessonIds, quizId] = await Promise.all([
    getRequiredLessonIdsForModule(moduleId),
    getQuizIdForModule(moduleId),
  ]);

  if (lessonIds.length > 0) {
    const { error: lessonErr } = await supabase
      .from("user_lesson_progress")
      .delete()
      .eq("user_id", userId)
      .in("lesson_id", lessonIds);
    if (lessonErr) throw new Error(lessonErr.message);
  }

  const { error: moduleErr } = await supabase
    .from("user_module_progress")
    .delete()
    .eq("user_id", userId)
    .eq("module_id", moduleId);
  if (moduleErr) throw new Error(moduleErr.message);

  if (quizId) {
    const { error: quizErr } = await supabase
      .from("quiz_attempts")
      .delete()
      .eq("user_id", userId)
      .eq("quiz_id", quizId);
    if (quizErr) throw new Error(quizErr.message);
  }
}
