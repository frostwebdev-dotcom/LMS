import {
  ADMIN_DEFAULT_PATH,
  ADMIN_ROUTE_PREFIX,
  STAFF_DEFAULT_PATH,
  isAllowedRedirect,
} from "@/lib/auth/config";
import type { UserRole } from "@/types/database";

type RoleSource = {
  role?: string | null;
  roles?: { name: string } | { name: string }[] | null;
};

export function normalizeRole(role: string | null | undefined): UserRole {
  return role === "admin" ? "admin" : "staff";
}

export function roleFromSource(source: RoleSource | null | undefined): UserRole {
  if (!source) return "staff";
  const joined = source.roles;
  const roleName =
    joined == null
      ? source.role
      : Array.isArray(joined)
        ? joined[0]?.name
        : joined.name;
  return normalizeRole(roleName);
}

export function defaultPathForRole(role: UserRole): string {
  return role === "admin" ? ADMIN_DEFAULT_PATH : STAFF_DEFAULT_PATH;
}

export function canAccessAdminRoute(role: UserRole): boolean {
  return role === "admin";
}

export function resolveRoleRedirect(role: UserRole, requestedPath?: string | null): string {
  if (!requestedPath || !isAllowedRedirect(requestedPath)) {
    return defaultPathForRole(role);
  }
  if (requestedPath.startsWith(ADMIN_ROUTE_PREFIX) && !canAccessAdminRoute(role)) {
    return STAFF_DEFAULT_PATH;
  }
  return requestedPath;
}

