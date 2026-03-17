/**
 * Annual training expiration: compute expiration date from completion date and
 * module configuration, and derive status (valid, expiring soon, expired).
 */

export const DEFAULT_EXPIRATION_MONTHS = 12;
/** Days before expiration to show "expiring soon". */
export const EXPIRING_SOON_DAYS = 30;

export type ExpirationStatus = "valid" | "expiring_soon" | "expired";

export interface ModuleExpiration {
  /** ISO date string when training expires. */
  expiresAt: string;
  /** Positive = days left, zero = today, negative = days since expired. */
  daysRemaining: number;
  status: ExpirationStatus;
}

/**
 * Resolves expiration months: null/undefined → default 12.
 */
export function resolveExpirationMonths(months: number | null | undefined): number {
  if (typeof months === "number" && months >= 1) return months;
  return DEFAULT_EXPIRATION_MONTHS;
}

/**
 * Computes expiration from completion timestamp and module expiration months.
 * Returns null if completedAt is missing; otherwise returns expiresAt, daysRemaining, and status.
 */
export function computeExpiration(
  completedAtIso: string | null | undefined,
  expirationMonths: number | null | undefined
): ModuleExpiration | null {
  if (!completedAtIso?.trim()) return null;
  const completed = new Date(completedAtIso);
  if (Number.isNaN(completed.getTime())) return null;

  const months = resolveExpirationMonths(expirationMonths);
  const expires = new Date(completed);
  expires.setUTCMonth(expires.getUTCMonth() + months);
  const expiresAt = expires.toISOString();

  const now = new Date();
  const diffMs = expires.getTime() - now.getTime();
  const daysRemaining = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  let status: ExpirationStatus;
  if (daysRemaining < 0) status = "expired";
  else if (daysRemaining <= EXPIRING_SOON_DAYS) status = "expiring_soon";
  else status = "valid";

  return { expiresAt, daysRemaining, status };
}
