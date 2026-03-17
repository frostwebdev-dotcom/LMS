/**
 * Types for staff dashboard. Status and progress are derived from
 * user_module_progress, user_lesson_progress, and quiz_attempts.
 */

export type ModuleProgressStatus = "not_started" | "in_progress" | "completed";

/** Training expiration status for completed modules. */
export type ExpirationStatus = "valid" | "expiring_soon" | "expired";

/** Expiration details when module is completed. */
export interface ModuleExpiration {
  expiresAt: string;
  daysRemaining: number;
  status: ExpirationStatus;
}

/** Quiz result for a module (when module has a quiz). null = no quiz or not attempted. */
export interface ModuleQuizResult {
  bestScorePercent: number;
  passed: boolean;
}

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
  /** Expiration (date, days remaining, status). Set when completed; null otherwise. */
  expiration: ModuleExpiration | null;
  /** Best quiz score and pass status. null when module has no quiz or user has not attempted. */
  quizResult: ModuleQuizResult | null;
}
