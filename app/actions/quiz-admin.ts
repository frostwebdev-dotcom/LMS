"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/get-session";
import { createClient } from "@/lib/supabase/server";
import {
  createQuizSchema,
  createQuestionSchema,
  createOptionSchema,
  updateQuestionSchema,
  updateOptionSchema,
} from "@/lib/validations/quiz";

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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/modules/${moduleId}`);
  return { success: true, id: data?.id };
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
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_questions").insert(parsed.data);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/modules/${moduleId}/quiz/edit`);
  return { success: true };
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
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_answers").insert({
    question_id: parsed.data.question_id,
    answer_text: parsed.data.option_text,
    is_correct: parsed.data.is_correct,
    sort_order: parsed.data.sort_order ?? 0,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/modules/${moduleId}/quiz/edit`);
  return { success: true };
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
  const supabase = await createClient();
  const { error } = await supabase
    .from("quiz_questions")
    .update({
      question_text: parsed.data.question_text,
      ...(parsed.data.sort_order !== undefined && { sort_order: parsed.data.sort_order }),
    })
    .eq("id", questionId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/modules/${moduleId}/quiz/edit`);
  return { success: true };
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
  const supabase = await createClient();
  const { error } = await supabase
    .from("quiz_answers")
    .update({
      answer_text: parsed.data.option_text,
      is_correct: parsed.data.is_correct,
      ...(parsed.data.sort_order !== undefined && { sort_order: parsed.data.sort_order }),
    })
    .eq("id", optionId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/modules/${moduleId}/quiz/edit`);
  return { success: true };
}
