import { createClient } from "@/lib/supabase/server";
import type { QuizAnswerRow, QuizAnswer, CreateAnswerInput, UpdateAnswerInput } from "@/types/quiz";

const TABLE = "quiz_answers";

/** Map DB row (answer_text) to app DTO (option_text) */
export function toQuizAnswer(row: QuizAnswerRow): QuizAnswer {
  return {
    id: row.id,
    question_id: row.question_id,
    option_text: row.answer_text,
    is_correct: row.is_correct,
    sort_order: row.sort_order,
    created_at: row.created_at,
  };
}

export async function getAnswersByQuestionIds(questionIds: string[]): Promise<QuizAnswer[]> {
  if (questionIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .in("question_id", questionIds)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toQuizAnswer(row as QuizAnswerRow));
}

export async function getAnswerById(answerId: string): Promise<QuizAnswer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", answerId).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return toQuizAnswer(data as QuizAnswerRow);
}

export async function createAnswer(input: CreateAnswerInput): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      question_id: input.question_id,
      answer_text: input.option_text,
      is_correct: input.is_correct,
      sort_order: input.sort_order ?? 0,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function updateAnswer(answerId: string, input: UpdateAnswerInput): Promise<void> {
  const supabase = await createClient();
  const payload: Partial<QuizAnswerRow> = {};
  if (input.option_text !== undefined) payload.answer_text = input.option_text;
  if (input.is_correct !== undefined) payload.is_correct = input.is_correct;
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
  if (Object.keys(payload).length === 0) return;
  const { error } = await supabase.from(TABLE).update(payload).eq("id", answerId);
  if (error) throw new Error(error.message);
}

/**
 * Deletes an answer option. Past attempt answers referencing it may set answer_id to null (schema-dependent).
 */
export async function deleteAnswer(answerId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from(TABLE).delete().eq("id", answerId);
  if (error) throw new Error(error.message);
}
