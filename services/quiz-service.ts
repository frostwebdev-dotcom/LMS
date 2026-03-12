import { createClient } from "@/lib/supabase/server";
import type { Quiz, QuizQuestion, QuizOption } from "@/types/database";

export interface QuestionWithOptions extends QuizQuestion {
  options: QuizOption[];
}

export interface QuizWithQuestions extends Quiz {
  questions: QuestionWithOptions[];
}

export async function getQuizByModuleId(moduleId: string): Promise<Quiz | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("module_id", moduleId)
    .limit(1)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as Quiz;
}

export async function getQuizWithQuestions(quizId: string): Promise<QuizWithQuestions | null> {
  const supabase = await createClient();
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();
  if (quizError || !quiz) return null;

  const { data: questions, error: qError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });
  if (qError) throw new Error(qError.message);

  if (!questions?.length) {
    return { ...quiz, questions: [] } as QuizWithQuestions;
  }

  const { data: options, error: optError } = await supabase
    .from("quiz_answers")
    .select("*")
    .in("question_id", questions.map((q) => q.id))
    .order("sort_order", { ascending: true });
  if (optError) throw new Error(optError.message);

  const optionsByQuestion = new Map<string, QuizOption[]>();
  for (const opt of options ?? []) {
    const row = opt as { id: string; question_id: string; answer_text: string; is_correct: boolean; sort_order: number; created_at: string };
    const list = optionsByQuestion.get(row.question_id) ?? [];
    list.push({ ...row, option_text: row.answer_text } as QuizOption);
    optionsByQuestion.set(row.question_id, list);
  }

  const questionsWithOptions: QuestionWithOptions[] = (questions as QuizQuestion[]).map(
    (q) => ({
      ...q,
      options: optionsByQuestion.get(q.id) ?? [],
    })
  );

  return {
    ...quiz,
    questions: questionsWithOptions,
  } as QuizWithQuestions;
}

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as Quiz;
}
