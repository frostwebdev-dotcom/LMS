/**
 * Database types for Harmony Hearts LMS.
 * Mirrors Supabase PostgreSQL schema.
 */

export type UserRole = "staff" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentType = "video" | "pdf" | "presentation" | "text";

export interface ModuleContent {
  id: string;
  module_id: string;
  title: string;
  content_type: ContentType;
  /** Storage path for media (video/pdf/presentation). Null/empty for text lessons. */
  storage_path?: string | null;
  /** Plain text content for lesson_type = 'text'. */
  content_text?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  passing_score_percent: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  sort_order: number;
  created_at: string;
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
  created_at: string;
}

export interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentProgress {
  id: string;
  user_id: string;
  content_id: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score_percent: number;
  passed: boolean;
  completed_at: string;
  created_at: string;
}

export interface QuizAttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  option_id: string | null;
  created_at: string;
}
