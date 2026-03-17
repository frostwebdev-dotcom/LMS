/**
 * Formats a module completion timestamp for display (date and exact time).
 * Uses the user's locale when available; falls back to a clear ISO-style display.
 * Reusable across staff and admin views.
 */

/**
 * Formats an ISO 8601 completion timestamp as a human-readable date and time.
 * Example outputs: "16 Mar 2025, 2:30 pm" (en) or locale-equivalent.
 */
export function formatModuleCompletedAt(isoString: string | null | undefined): string {
  if (isoString == null || isoString === "") return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Short label for use in tables or badges (e.g. "16 Mar 2025, 2:30 pm").
 * Same as formatModuleCompletedAt; alias for clarity at call sites.
 */
export function formatCompletionDateTime(isoString: string | null | undefined): string {
  return formatModuleCompletedAt(isoString);
}

/**
 * Formats an expiration date (date only, no time) for compliance display.
 * Example: "16 Mar 2026".
 */
export function formatExpirationDate(isoString: string | null | undefined): string {
  if (isoString == null || isoString === "") return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
