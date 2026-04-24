/**
 * Types for admin dashboard. Stats are derived from Supabase (no mock data).
 */

import type { TrainingCategory, TrainingModule } from "./database";

export interface ComplianceCounts {
  valid: number;
  expiringSoon: number;
  expired: number;
}

export interface AdminDashboardStats {
  totalStaff: number;
  totalModules: number;
  completedModules: number;
  inProgressTraining: number;
  /** Completed trainings by expiration status (valid, expiring soon, expired). */
  compliance: ComplianceCounts;
}

/** One category row on the admin dashboard with its modules (real Supabase data). */
export interface AdminTrainingCategoryBlock {
  category: TrainingCategory;
  modules: TrainingModule[];
}
