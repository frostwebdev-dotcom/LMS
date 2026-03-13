/**
 * Types for staff dashboard. Status and progress are derived from
 * user_module_progress, user_lesson_progress, and quiz_attempts.
 */

export type ModuleProgressStatus = "not_started" | "in_progress" | "completed";

export interface StaffDashboardModule {
  id: string;
  title: string;
  description: string | null;
  /** Estimated time to complete (minutes). From DB or computed from lesson/quiz count. */
  estimatedDurationMinutes: number;
  status: ModuleProgressStatus;
  progressPercent: number;
  contentCount: number;
  quizCount: number;
  progressCompletedAt: string | null;
}
