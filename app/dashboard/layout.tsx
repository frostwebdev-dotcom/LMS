import Link from "next/link";
import { isAdmin, requireUserOrRedirect } from "@/lib/auth/get-session";
import { signOut } from "@/app/actions/auth";
import { ADMIN_ROUTE_PREFIX } from "@/lib/auth/config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUserOrRedirect();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="font-semibold text-slate-800">
            Harmony Hearts Training
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user.fullName ?? user.email}
            </span>
            {isAdmin(user) && (
              <Link
                href={ADMIN_ROUTE_PREFIX}
                className="text-sm text-primary-600 hover:underline"
              >
                Admin
              </Link>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
