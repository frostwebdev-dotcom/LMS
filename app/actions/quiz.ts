"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/get-session";
import { submitQuizSchema } from "@/lib/validations/quiz";
import { updateModuleCompletionIfEligible } from "@/services/module-completion-service";
import { submitQuizAndGetResult } from "@/services/progress-service";

export type QuizSubmitResult =
  | { success: true; scorePercent: number; passed: boolean; moduleId: string }
  | { success: false; error: string };

export async function submitQuizAction(
  _prev: unknown,
  formData: FormData
): Promise<QuizSubmitResult> {
  let user;
  try {
    user = await requireSessionUser();
  } catch {
    return { success: false, error: "Please sign in again." };
  }
  const quizId = formData.get("quiz_id");
  const answersJson = formData.get("answers");
  if (typeof quizId !== "string" || typeof answersJson !== "string") {
    return { success: false, error: "Invalid submission" };
  }
  let answers: { question_id: string; option_id: string }[];
  try {
    answers = JSON.parse(answersJson) as { question_id: string; option_id: string }[];
  } catch {
    return { success: false, error: "Invalid answers" };
  }
  const parsed = submitQuizSchema.safeParse({ quiz_id: quizId, answers });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  try {
    const result = await submitQuizAndGetResult(user.id, parsed.data.quiz_id, parsed.data.answers);
    if (result.passed) {
      try {
        await updateModuleCompletionIfEligible(user.id, result.moduleId);
      } catch (e) {
        console.error("[module-completion] after quiz pass:", e);
      }
      revalidatePath(`/dashboard/modules/${result.moduleId}`);
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/certificates");
    }
    return {
      success: true,
      scorePercent: result.scorePercent,
      passed: result.passed,
      moduleId: result.moduleId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit quiz",
    };
  }
}
