"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/get-session";
import { createClient } from "@/lib/supabase/server";
import {
  createQuizSchema,
  createQuestionSchema,
  createOptionSchema,
  updateQuizSchema,
  updateQuestionSchema,
  updateOptionSchema,
} from "@/lib/validations/quiz";
import { updateQuiz } from "@/services/quiz-service";
import { createQuestion, updateQuestion, deleteQuestion } from "@/services/quiz-questions-service";
import { createAnswer, updateAnswer, deleteAnswer } from "@/services/quiz-answers-service";

export type QuizAdminResult = { success: true; id?: string } | { success: false; error: string };

export async function createQuizAction(
  moduleId: string,
  _prev: unknown,
  formData: FormData
): Promise<QuizAdminResult> {
  await requireAdmin();
  const parsed = createQuizSchema.safeParse({
    module_id: moduleId,
    title: formData.get("title") ?? "",
    description: formData.get("description") || null,
    passing_score_percent: formData.get("passing_score_percent")
      ? Number(formData.get("passing_score_percent"))
      : 80,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quizzes")
      .insert(parsed.data)
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };
    revalidatePath(`/admin/modules/${moduleId}`);
    return { success: true, id: data?.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create quiz" };
  }
}

export async function updateQuizAction(
  quizId: string,
  moduleId: string,
  _prev: unknown,
  formData: FormData
): Promise<QuizAdminResult> {
  await requireAdmin();
  const title = formData.get("title");
  const description = formData.get("description");
  const passingScore = formData.get("passing_score_percent");
  const parsed = updateQuizSchema.safeParse({
    title: title !== undefined && title !== "" ? String(title).trim() : undefined,
    description: description !== undefined ? (description === "" ? null : String(description).trim()) : undefined,
    passing_score_percent:
      passingScore !== undefined && passingScore !== ""
        ? Number(passingScore)
        : undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  try {
    await updateQuiz(quizId, parsed.data);
    revalidatePath(`/admin/modules/${moduleId}/quiz/edit`);
    revalidatePath(`/admin/modules/${moduleId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update quiz" };
  }
}

/** Creates a quiz and redirects to edit page. Use from New Quiz page. */
export async function createQuizAndRedirectAction(
  moduleId: string,
  _prev: unknown,
  formData: FormData
): Promise<QuizAdminResult> {
  const result = await createQuizAction(moduleId, _prev, formData);
  if (result.success) redirect(`/admin/modules/${moduleId}/quiz/edit`);
  return result;
}

export async function addQuestionAction(
  quizId: string,
  moduleId: string,
  _prev: unknown,
  formData: FormData
): Promise<QuizAdminResult> {
  await requireAdmin();
  const parsed = createQuestionSchema.safeParse({
    quiz_id: quizId,
    question_text: formData.get("question_text") ?? "",
    sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : 0,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  try {
    await createQuestion(parsed.data);
    revalidatePath(`/admin/modules/${moduleId}/quiz/edit`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to add question" };
  }
}

export async function addOptionAction(
  questionId: string,
  quizId: string,
  moduleId: string,
  _prev: unknown,
  formData: FormData
): Promise<QuizAdminResult> {
  await requireAdmin();
  const parsed = createOptionSchema.safeParse({
    question_id: questionId,
    option_text: formData.get("option_text") ?? "",
    is_correct: formData.get("is_correct") === "on" || formData.get("is_correct") === "true",
    sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : 0,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  try {
    await createAnswer(parsed.data);
    revalidatePath(`/admin/modules/${moduleId}/quiz/edit`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to add option" };
  }
}

export async function updateQuestionAction(
  questionId: string,
  moduleId: string,
  _prev: unknown,
  formData: FormData
): Promise<QuizAdminResult> {
  await requireAdmin();
  const parsed = updateQuestionSchema.safeParse({
    question_text: formData.get("question_text") ?? "",
    sort_order: formData.get("sort_order") !== undefined && formData.get("sort_order") !== ""
      ? Number(formData.get("sort_order"))
      : undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  try {
    await updateQuestion(questionId, parsed.data);
    revalidatePath(`/admin/modules/${moduleId}/quiz/edit`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update question" };
  }
}

export async function updateOptionAction(
  optionId: string,
  moduleId: string,
  _prev: unknown,
  formData: FormData
): Promise<QuizAdminResult> {
  await requireAdmin();
  const parsed = updateOptionSchema.safeParse({
    option_text: formData.get("option_text") ?? "",
    is_correct: formData.get("is_correct") === "on" || formData.get("is_correct") === "true",
    sort_order: formData.get("sort_order") !== undefined && formData.get("sort_order") !== ""
      ? Number(formData.get("sort_order"))
      : undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  try {
    await updateAnswer(optionId, parsed.data);
    revalidatePath(`/admin/modules/${moduleId}/quiz/edit`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update option" };
  }
}

export async function deleteQuestionAction(
  questionId: string,
  moduleId: string
): Promise<QuizAdminResult> {
  await requireAdmin();
  if (!questionId || !moduleId) {
    return { success: false, error: "Missing question or module." };
  }
  try {
    await deleteQuestion(questionId);
    revalidatePath(`/admin/modules/${moduleId}/quiz/edit`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete question" };
  }
}

/** Form-callable: reads question_id and module_id from FormData, then deletes the question. */
export async function deleteQuestionActionForm(formData: FormData): Promise<QuizAdminResult> {
  const questionId = formData.get("question_id");
  const moduleId = formData.get("module_id");
  if (typeof questionId !== "string" || typeof moduleId !== "string") {
    return { success: false, error: "Missing question or module." };
  }
  return deleteQuestionAction(questionId, moduleId);
}

export async function deleteOptionAction(
  optionId: string,
  moduleId: string
): Promise<QuizAdminResult> {
  await requireAdmin();
  if (!optionId || !moduleId) {
    return { success: false, error: "Missing option or module." };
  }
  try {
    await deleteAnswer(optionId);
    revalidatePath(`/admin/modules/${moduleId}/quiz/edit`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to remove option" };
  }
}

/** Form-callable: reads option_id and module_id from FormData, then deletes the option. */
export async function deleteOptionActionForm(formData: FormData): Promise<QuizAdminResult> {
  const optionId = formData.get("option_id");
  const moduleId = formData.get("module_id");
  if (typeof optionId !== "string" || typeof moduleId !== "string") {
    return { success: false, error: "Missing option or module." };
  }
  return deleteOptionAction(optionId, moduleId);
}
