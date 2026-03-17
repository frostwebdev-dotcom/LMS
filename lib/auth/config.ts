/**
 * Auth route and redirect configuration.
 * Central place for paths used by middleware and auth flows.
 */

/** Path for the login page (unauthenticated users are sent here). */
export const AUTH_LOGIN_PATH = "/login";

/** Path for the sign-up page. */
export const AUTH_SIGNUP_PATH = "/signup";

/** Path for the forgot-password request page. */
export const AUTH_FORGOT_PASSWORD_PATH = "/forgot-password";

/** Path for the reset-password page (recovery link lands here). */
export const AUTH_RESET_PASSWORD_PATH = "/reset-password";

/** Path for the authenticated account/settings page (change password). */
export const ACCOUNT_PATH = "/dashboard/account";

/** Default destination after login for staff. */
export const STAFF_DEFAULT_PATH = "/dashboard";

/** Default destination after login for admin (can still use Staff view). */
export const ADMIN_DEFAULT_PATH = "/admin";

/** Path prefix for staff-only routes (protected). */
export const STAFF_ROUTE_PREFIX = "/dashboard";

/** Path prefix for admin-only routes (protected, role-checked in layout). */
export const ADMIN_ROUTE_PREFIX = "/admin";

/** Public paths that do not require authentication. */
export const PUBLIC_PATHS = ["/", AUTH_LOGIN_PATH, AUTH_SIGNUP_PATH] as const;

/**
 * Allowed redirect targets after login (avoid open redirect).
 * Only paths starting with these prefixes are accepted from ?redirect=.
 */
export const ALLOWED_REDIRECT_PREFIXES = [STAFF_ROUTE_PREFIX, ADMIN_ROUTE_PREFIX, "/"] as const;

export function isAllowedRedirect(path: string): boolean {
  if (!path || !path.startsWith("/")) return false;
  return ALLOWED_REDIRECT_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
}

/** Paths that should redirect to login when accessed unauthenticated. */
export function isProtectedPath(pathname: string): boolean {
  return pathname.startsWith(STAFF_ROUTE_PREFIX) || pathname.startsWith(ADMIN_ROUTE_PREFIX);
}

/** Paths that are considered "auth" pages (login/signup, forgot/reset password). */
export function isAuthPath(pathname: string): boolean {
  return (
    pathname === AUTH_LOGIN_PATH ||
    pathname === AUTH_SIGNUP_PATH ||
    pathname === AUTH_FORGOT_PASSWORD_PATH ||
    pathname === AUTH_RESET_PASSWORD_PATH
  );
}
