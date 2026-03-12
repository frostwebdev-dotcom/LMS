"use client";

import type { UserRole } from "@/types";

/**
 * Hook for role-based UI (e.g. show Admin link only for admins).
 * Prefer server-side requireAdmin() / getSessionUser() for data protection.
 */
export function useRole(): UserRole | null {
  // TODO: read from auth context or session
  return null;
}
