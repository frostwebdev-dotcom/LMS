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

export type ContentType = "video" | "pdf" | "image" | "text";

export interface ModuleContent {
  id: string;
  module_id: string;
  title: string;
  content_type: ContentType;
  /** Storage path for media (video/pdf/image). Null/empty for text lessons. */
  storage_path?: string | null;
  /** Plain text content for lesson_type = 'text'. */
  content_text?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use types from @/types/quiz */
export type { Quiz, QuizQuestion, QuizAttempt } from "./quiz";
/** QuizAnswer in quiz has option_text; alias for backward compatibility */
export type { QuizAnswer as QuizOption } from "./quiz";

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

/** @deprecated Use types from @/types/quiz */
export type { QuizAttemptAnswer } from "./quiz";
