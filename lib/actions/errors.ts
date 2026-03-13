/**
 * Map raw errors to user-friendly messages for admin actions.
 * Avoids exposing internal details (e.g. RLS, constraint names).
 */
export function toUserFriendlyError(message: string): string {
  const m = message.toLowerCase();
  if (/row-level security|rls|policy/i.test(m)) {
    return "You don't have permission to perform this action. Try signing in again.";
  }
  if (/fetch failed|timeout|econnrefused|enotfound|network/i.test(m)) {
    return "Network error. Check your connection and try again.";
  }
  if (/foreign key|violates.*constraint/i.test(m)) {
    return "This item is in use and cannot be deleted yet.";
  }
  if (/duplicate|unique.*violat/i.test(m)) {
    return "A record with this value already exists.";
  }
  if (/payload too large|entity too large|file size|storage quota/i.test(m)) {
    return "File is too large. Try a smaller file.";
  }
  if (/bucket|storage.*not found|object.*not found/i.test(m)) {
    return "Storage error. Please try again or contact support.";
  }
  return message.length > 120 ? "Something went wrong. Please try again." : message;
}
