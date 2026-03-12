export {
  normalizeRole,
  roleFromSource,
  defaultPathForRole,
  canAccessAdminRoute,
  resolveRoleRedirect,
} from "./guards";
export {
  getSessionUser,
  hasRole,
  isAdmin,
  isStaff,
  requireSessionUser,
  requireAdmin,
  requireUserOrRedirect,
  requireAdminOrRedirect,
} from "./get-session";
export {
  AUTH_LOGIN_PATH,
  AUTH_SIGNUP_PATH,
  STAFF_DEFAULT_PATH,
  ADMIN_DEFAULT_PATH,
  STAFF_ROUTE_PREFIX,
  ADMIN_ROUTE_PREFIX,
  isAllowedRedirect,
  isProtectedPath,
  isAuthPath,
} from "./config";
