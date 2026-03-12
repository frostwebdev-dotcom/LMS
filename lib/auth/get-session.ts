import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AUTH_LOGIN_PATH, STAFF_ROUTE_PREFIX } from "@/lib/auth/config";
import { normalizeRole, roleFromSource } from "@/lib/auth/guards";
import type { SessionUser } from "@/types/auth";
import type { UserRole } from "@/types/database";

/** Profile row when joined with roles (schema with role_id). Supabase may return roles as object or array. */
interface ProfileWithRoleRow {
  id: string;
  email: string;
  full_name: string | null;
  role_id?: string | null;
  role?: UserRole | null;
  roles?: { name: string } | { name: string }[] | null;
}

function roleFromRow(row: ProfileWithRoleRow): UserRole {
  return roleFromSource(row);
}

function toSessionUser(row: ProfileWithRoleRow): SessionUser {
  return {
    id: row.id,
    email: row.email,
    role: roleFromRow(row),
    fullName: row.full_name,
  };
}

export function hasRole(user: Pick<SessionUser, "role">, role: UserRole): boolean {
  return user.role === role;
}

export function isAdmin(user: Pick<SessionUser, "role">): boolean {
  return hasRole(user, "admin");
}

export function isStaff(user: Pick<SessionUser, "role">): boolean {
  return hasRole(user, "staff");
}

/**
 * Returns the current session user (profile + role) or null if not authenticated.
 * Supports both schemas: profiles.role_id + roles.name and legacy profiles.role.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: row, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role_id, roles(name)")
    .eq("id", authUser.id)
    .single();

  if (!error && row) return toSessionUser(row as unknown as ProfileWithRoleRow);

  const legacy = await getSessionUserWithRoleColumn(supabase, authUser.id);
  if (legacy) return legacy;

  // Fallback for users that have an auth account but no profile row yet.
  // This prevents authenticated users from being redirected in a loop.
  const metadataRole =
    authUser.user_metadata?.role ?? authUser.app_metadata?.role ?? null;
  return {
    id: authUser.id,
    email: authUser.email ?? "",
    role: normalizeRole(typeof metadataRole === "string" ? metadataRole : null),
    fullName:
      typeof authUser.user_metadata?.full_name === "string"
        ? authUser.user_metadata.full_name
        : null,
  };
}

/**
 * Fallback when schema has profiles.role (enum) instead of role_id + roles join.
 */
async function getSessionUserWithRoleColumn(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<SessionUser | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .single();

  if (error || !profile) return null;

  const p = profile as { id: string; email: string; full_name: string | null; role?: string };
  return {
    id: p.id,
    email: p.email,
    role: normalizeRole(p.role),
    fullName: p.full_name,
  };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (!isAdmin(user)) {
    throw new Error("Forbidden: admin only");
  }
  return user;
}

/**
 * Route guard: requires authentication and redirects to login otherwise.
 */
export async function requireUserOrRedirect(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(AUTH_LOGIN_PATH);
  return user;
}

/**
 * Route guard: requires admin and redirects staff to dashboard.
 */
export async function requireAdminOrRedirect(): Promise<SessionUser> {
  const user = await requireUserOrRedirect();
  if (!isAdmin(user)) redirect(STAFF_ROUTE_PREFIX);
  return user;
}
