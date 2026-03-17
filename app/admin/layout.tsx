import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import { signOut } from "@/app/actions/auth";
import { ACCOUNT_PATH, STAFF_ROUTE_PREFIX } from "@/lib/auth/config";
import { Logo } from "@/components/layout/Logo";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminOrRedirect();

  return (
    <div className="min-h-screen bg-primary-50/30">
      <header className="border-b border-primary-200 bg-white shadow-sm">
        <div className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Left: logo + all nav items, fully expanded */}
          <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto">
            <Logo href="/admin" height={36} className="shrink-0" />
            <nav className="flex items-center gap-3 sm:gap-4" aria-label="Admin menu">
              <Link href="/admin" className="whitespace-nowrap text-sm font-medium text-primary-700 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
                Dashboard
              </Link>
              <Link href="/admin/modules" className="whitespace-nowrap text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
                Modules
              </Link>
              <Link href="/admin/assignments" className="whitespace-nowrap text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
                Assignments
              </Link>
              <Link href="/admin/progress" className="whitespace-nowrap text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
                Staff progress
              </Link>
              <Link href="/admin/users" className="whitespace-nowrap text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
                Users
              </Link>
              <Link href={STAFF_ROUTE_PREFIX} className="whitespace-nowrap text-sm font-medium text-accent-600 hover:text-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 rounded px-2 py-1">
                Staff view
              </Link>
            </nav>
          </div>
          {/* Right: Account, email, Sign out */}
          <div className="flex shrink-0 items-center gap-3 border-l border-primary-200 pl-4">
            <Link href={ACCOUNT_PATH} className="whitespace-nowrap text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
              Account
            </Link>
            <span className="text-sm text-primary-700 truncate max-w-[180px] sm:max-w-[240px]" title={user.email ?? undefined}>
              {user.email}
            </span>
            <form action={signOut}>
              <button type="submit" className="whitespace-nowrap text-sm text-primary-700 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
