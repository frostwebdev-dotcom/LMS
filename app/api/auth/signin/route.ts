import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_LOGIN_PATH,
  isAllowedRedirect
} from "@/lib/auth/config";
import { resolveRoleRedirect, roleFromSource } from "@/lib/auth/guards";
import type { UserRole } from "@/types/database";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const wantsJson = request.headers.get("accept")?.includes("application/json");
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = formData.get("redirect")?.toString();

  if (!email || !password) {
    if (wantsJson) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      );
    }
    const url = new URL(AUTH_LOGIN_PATH, request.url);
    url.searchParams.set("error", "Email and password are required");
    if (redirectTo && isAllowedRedirect(redirectTo)) url.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(url, 303);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (wantsJson) {
      return NextResponse.json({ ok: false, error: "Server misconfiguration" }, { status: 500 });
    }
    const url = new URL(AUTH_LOGIN_PATH, request.url);
    url.searchParams.set("error", "Server misconfiguration");
    return NextResponse.redirect(url, 303);
  }

  let role: UserRole = "staff";

  const response = new NextResponse(null, { status: 200 });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const opts = {
            ...options,
            path: "/",
            sameSite: "lax" as const,
            ...(request.url.startsWith("https://") ? { secure: true } : {}),
          } as Record<string, unknown>;
          response.cookies.set(name, value, opts);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (wantsJson) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
    }
    const url = new URL(AUTH_LOGIN_PATH, request.url);
    url.searchParams.set("error", error.message);
    if (redirectTo && isAllowedRedirect(redirectTo)) url.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(url, 303);
  }

  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id, roles(name)")
      .eq("id", data.user.id)
      .single();
    role = roleFromSource(
      profile as { role?: string | null; roles?: { name: string } | { name: string }[] | null } | null
    );
  }
  const path = resolveRoleRedirect(
    role,
    redirectTo && isAllowedRedirect(redirectTo) ? redirectTo : null
  );

  const fullPath = new URL(path, request.url).pathname;
  if (wantsJson) {
    response.headers.set("Content-Type", "application/json");
    return new NextResponse(JSON.stringify({ ok: true, redirectTo: fullPath }), {
      status: 200,
      headers: response.headers,
    });
  }
  const html = `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0;url=${fullPath}"></head><body>Redirecting to <a href="${fullPath}">${fullPath}</a>...</body></html>`;
  response.headers.set("Content-Type", "text/html; charset=utf-8");
  return new NextResponse(html, {
    status: 200,
    headers: response.headers,
  });
}
