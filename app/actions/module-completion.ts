"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/get-session";
import { getModuleCompletionState } from "@/services/module-completion-service";
import { markModuleComplete } from "@/services/progress-service";

export type CompleteModuleTrainingResult =
  | { success: true; alreadyCompleted?: boolean }
  | { success: false; error: string };

/**
 * Marks the module as completed for the current user only when all required
 * content is viewed and the quiz is passed (if applicable). Called from the
 * "Complete Training" button on the module page.
 */
export async function completeModuleTrainingAction(
  moduleId: string
): Promise<CompleteModuleTrainingResult> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "Please sign in again." };

  const state = await getModuleCompletionState(user.id, moduleId);

  if (!state.allLessonsCompleted) {
    return {
      success: false,
      error: "View all lessons before completing this training.",
    };
  }
  if (!state.quizPassed) {
    return {
      success: false,
      error: state.hasQuiz
        ? "Pass the quiz before completing this training."
        : "Complete all requirements before completing this training.",
    };
  }
  if (state.completedAt) {
    return { success: true, alreadyCompleted: true };
  }

  await markModuleComplete(user.id, moduleId);
  revalidatePath(`/dashboard/modules/${moduleId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
