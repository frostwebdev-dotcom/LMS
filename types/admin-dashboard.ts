/**
 * Types for admin dashboard. Stats are derived from Supabase (no mock data).
 */

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
