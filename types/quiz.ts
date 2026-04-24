/**
 * Quiz data types aligned with Supabase schema.
 * Row types match DB columns; DTOs are used in app/UI (e.g. option_text for answers).
 */

// ============== Row types (match Supabase tables exactly) ==============

/** quizzes */
export interface QuizRow {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  passing_score_percent: number;
  created_at: string;
  updated_at: string;
}

/** quiz_questions */
export interface QuizQuestionRow {
  id: string;
  quiz_id: string;
  question_text: string;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

/** quiz_answers (DB column is answer_text) */
export interface QuizAnswerRow {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

/** quiz_attempts */
export interface QuizAttemptRow {
  id: string;
  user_id: string;
  quiz_id: string;
  score_percent: number;
  passed: boolean;
  completed_at: string;
  created_at: string;
}

/** quiz_attempt_answers (DB column is answer_id, FK to quiz_answers) */
export interface QuizAttemptAnswerRow {
  id: string;
  attempt_id: string;
  question_id: string;
  answer_id: string | null;
  created_at: string;
}

// ============== App DTOs (used in UI / services) ==============

export type Quiz = QuizRow;

export type QuizQuestion = QuizQuestionRow;

/** Answer option as used in app (option_text for display; maps from answer_text in DB) */
export interface QuizAnswer {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
  created_at: string;
}

export interface QuestionWithOptions extends QuizQuestion {
  options: QuizAnswer[];
}

export interface QuizWithQuestions extends Quiz {
  questions: QuestionWithOptions[];
}

export type QuizAttempt = QuizAttemptRow;

export interface QuizAttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  option_id: string | null;
  created_at: string;
}

// ============== Insert / Update payloads ==============

export interface CreateQuizInput {
  module_id: string;
  title: string;
  description?: string | null;
  passing_score_percent?: number;
}

export interface UpdateQuizInput {
  title?: string;
  description?: string | null;
  passing_score_percent?: number;
}

export interface CreateQuestionInput {
  quiz_id: string;
  question_text: string;
  sort_order?: number;
}

export interface UpdateQuestionInput {
  question_text?: string;
  sort_order?: number;
}

/** App uses option_text; DB stores answer_text */
export interface CreateAnswerInput {
  question_id: string;
  option_text: string;
  is_correct: boolean;
  sort_order?: number;
}

export interface UpdateAnswerInput {
  option_text?: string;
  is_correct?: boolean;
  sort_order?: number;
}

export interface SubmitQuizInput {
  quiz_id: string;
  answers: { question_id: string; option_id: string }[];
}

export interface QuizSubmitResult {
  scorePercent: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  /** Training module this quiz belongs to (for auto-completion after a pass). */
  moduleId: string;
}
