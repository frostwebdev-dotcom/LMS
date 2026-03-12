"use client";

/**
 * Client-side auth hook.
 * Use for components that need session state or loading.
 * Server-side auth: use getSessionUser() from lib/auth/get-session.
 */
export function useAuth() {
  // TODO: integrate with Supabase auth state (e.g. subscribe to onAuthStateChange)
  return {
    user: null,
    isLoading: false,
    signOut: async () => {},
  };
}
