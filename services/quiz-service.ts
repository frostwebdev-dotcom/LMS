import { createClient } from "@/lib/supabase/server";
import type {
  Quiz,
  QuizRow,
  QuizWithQuestions,
  QuestionWithOptions,
  UpdateQuizInput,
} from "@/types/quiz";
import { getQuestionsByQuizId } from "@/services/quiz-questions-service";
import { getAnswersByQuestionIds } from "@/services/quiz-answers-service";

export type { QuizWithQuestions, QuestionWithOptions } from "@/types/quiz";

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

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("quizzes").select("*").eq("id", quizId).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as Quiz;
}

/**
 * Fetches a quiz with all questions and answers (options), ordered by sort_order.
 */
export async function getQuizWithQuestions(quizId: string): Promise<QuizWithQuestions | null> {
  const supabase = await createClient();
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();
  if (quizError || !quiz) return null;

  const questions = await getQuestionsByQuizId(quizId);
  if (questions.length === 0) {
    return { ...(quiz as QuizRow), questions: [] } as QuizWithQuestions;
  }

  const questionIds = questions.map((q) => q.id);
  const answers = await getAnswersByQuestionIds(questionIds);

  const optionsByQuestion = new Map<string, typeof answers>();
  for (const a of answers) {
    const list = optionsByQuestion.get(a.question_id) ?? [];
    list.push(a);
    optionsByQuestion.set(a.question_id, list);
  }

  const questionsWithOptions: QuestionWithOptions[] = questions.map((q) => ({
    ...q,
    options: optionsByQuestion.get(q.id) ?? [],
  }));

  return {
    ...(quiz as QuizRow),
    questions: questionsWithOptions,
  } as QuizWithQuestions;
}

/**
 * Updates quiz metadata (title, description, passing_score_percent). Used by admin.
 */
export async function updateQuiz(
  quizId: string,
  input: UpdateQuizInput
): Promise<void> {
  const supabase = await createClient();
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.passing_score_percent !== undefined)
    payload.passing_score_percent = input.passing_score_percent;
  if (Object.keys(payload).length === 0) return;
  const { error } = await supabase.from("quizzes").update(payload).eq("id", quizId);
  if (error) throw new Error(error.message);
}
