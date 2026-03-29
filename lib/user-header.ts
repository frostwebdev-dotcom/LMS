/**
 * Display helpers for app shell headers (avatar initials, safe truncation).
 */

export function getUserInitials(
  fullName: string | null | undefined,
  email: string
): string {
  const n = (fullName ?? "").trim();
  if (n.length > 0) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.[0];
      const b = parts[parts.length - 1]?.[0];
      if (a && b) return `${a}${b}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const local = email.split("@")[0] ?? "";
  return (local.slice(0, 2) || "?").toUpperCase();
}

export function getUserDisplayName(
  fullName: string | null | undefined,
  email: string
): string {
  const n = (fullName ?? "").trim();
  return n.length > 0 ? n : email;
}
