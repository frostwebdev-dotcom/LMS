import { createClient } from "@/lib/supabase/server";
import type { QuizQuestionRow, CreateQuestionInput, UpdateQuestionInput } from "@/types/quiz";

const TABLE = "quiz_questions";

export async function getQuestionsByQuizId(quizId: string): Promise<QuizQuestionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as QuizQuestionRow[];
}

export async function getQuestionById(questionId: string): Promise<QuizQuestionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", questionId).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as QuizQuestionRow;
}

export async function createQuestion(input: CreateQuestionInput): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      quiz_id: input.quiz_id,
      question_text: input.question_text,
      sort_order: input.sort_order ?? 0,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function updateQuestion(
  questionId: string,
  input: UpdateQuestionInput
): Promise<void> {
  const supabase = await createClient();
  const payload: Partial<QuizQuestionRow> = {};
  if (input.question_text !== undefined) payload.question_text = input.question_text;
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
  if (Object.keys(payload).length === 0) return;
  const { error } = await supabase.from(TABLE).update(payload).eq("id", questionId);
  if (error) throw new Error(error.message);
}

/**
 * Deletes a question. Answer options are removed by DB CASCADE.
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from(TABLE).delete().eq("id", questionId);
  if (error) throw new Error(error.message);
}
