import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_LOGIN_PATH,
  ADMIN_ROUTE_PREFIX,
  isAuthPath,
  isProtectedPath,
} from "@/lib/auth/config";
import { canAccessAdminRoute, resolveRoleRedirect, roleFromSource } from "@/lib/auth/guards";
import type { UserRole } from "@/types/database";

/**
 * Refreshes session cookies and enforces auth/redirect rules.
 * - Unauthenticated users hitting protected routes → redirect to login with ?redirect=
 * - Authenticated users hitting login/signup or / → redirect to dashboard (or admin)
 * - Session is refreshed on every request so cookies stay valid.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => {
          const opts = {
            ...options,
            path: "/",
            sameSite: "lax" as const,
          } as Record<string, unknown>;
          response.cookies.set(name, value, opts);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_LOGIN_PATH;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (!user) return response;

  let role: UserRole = "staff";
  if (
    pathname === "/" ||
    isAuthPath(pathname) ||
    pathname.startsWith(ADMIN_ROUTE_PREFIX)
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id, roles(name)")
      .eq("id", user.id)
      .maybeSingle();
    role = roleFromSource(
      profile as { role?: string | null; roles?: { name: string } | { name: string }[] | null } | null
    );
  }

  if (pathname.startsWith(ADMIN_ROUTE_PREFIX) && !canAccessAdminRoute(role)) {
    const url = request.nextUrl.clone();
    url.pathname = resolveRoleRedirect(role, null);
    return NextResponse.redirect(url);
  }

  if (isAuthPath(pathname) || pathname === "/") {
    const redirectTo = request.nextUrl.searchParams.get("redirect");
    const target = resolveRoleRedirect(role, redirectTo);
    const url = request.nextUrl.clone();
    url.pathname = target;
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  return response;
}
