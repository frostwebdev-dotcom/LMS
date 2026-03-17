import Link from "next/link";
import { isAdmin, requireUserOrRedirect } from "@/lib/auth/get-session";
import { signOut } from "@/app/actions/auth";
import { ACCOUNT_PATH, ADMIN_ROUTE_PREFIX } from "@/lib/auth/config";
import { Logo } from "@/components/layout/Logo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUserOrRedirect();

  return (
    <div className="min-h-screen bg-primary-50/30">
      <header className="border-b border-primary-200 bg-white shadow-sm">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 px-4 sm:px-6">
          <Logo href="/dashboard" height={36} />
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:gap-x-4" aria-label="User menu">
            <span className="text-sm text-primary-800 truncate max-w-[140px] sm:max-w-none">
              {user.fullName ?? user.email}
            </span>
            <Link
              href={ACCOUNT_PATH}
              className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              Account
            </Link>
            {isAdmin(user) && (
              <Link
                href={ADMIN_ROUTE_PREFIX}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1"
              >
                Admin
              </Link>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-primary-700 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
