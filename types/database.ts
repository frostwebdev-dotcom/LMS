/**
 * Database types for Harmony Hearts LMS.
 * Mirrors Supabase PostgreSQL schema.
 */

export type UserRole = "staff" | "admin";

/** Portal training grouping (e.g. Homecare, Leadership). */
export interface TrainingCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** Optional UI hint (e.g. Lucide icon name). */
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  /** Required FK to training_categories (see migrations). */
  category_id: string;
  /** Present when loaded with a category join; may be null if embed filtered by RLS. */
  category?: TrainingCategory | null;
  /** Months after completion until training expires. Null = use default (12). */
  expiration_months?: number | null;
  /** Estimated minutes (column on DB; optional in types for older rows). */
  estimated_duration_minutes?: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentType = "video" | "pdf" | "image" | "text" | "csv";

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

export type CertificateStatus = "pending_pdf" | "issued" | "pdf_failed";

/** Completion certificate (one per user per module while progress exists). */
export interface Certificate {
  id: string;
  user_id: string;
  module_id: string;
  module_progress_id: string;
  certificate_number: string;
  issued_at: string;
  /** Same moment as user_module_progress.completed_at when issued. */
  completion_date: string;
  pdf_storage_path: string | null;
  /** e.g. signed_url_private_bucket — PDFs use private storage + signed URLs. */
  pdf_access_strategy: string;
  status: CertificateStatus;
  created_at: string;
  updated_at: string;
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

/** @deprecated Use types from @/types/quiz */
export type { QuizAttemptAnswer } from "./quiz";
