import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import { signOut } from "@/app/actions/auth";
import { STAFF_ROUTE_PREFIX } from "@/lib/auth/config";
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
        <div className="mx-auto flex h-14 max-w-6xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo href="/admin" height={36} />
            <nav className="flex items-center gap-3 sm:gap-4" aria-label="Admin menu">
              <Link href="/admin" className="text-sm font-medium text-primary-700 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
                Dashboard
              </Link>
              <Link href="/admin/modules" className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
                Modules
              </Link>
              <Link href="/admin/progress" className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
                Staff progress
              </Link>
              <Link href="/admin/users" className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
                Users
              </Link>
              <Link href={STAFF_ROUTE_PREFIX} className="text-sm font-medium text-accent-600 hover:text-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 rounded px-2 py-1">
                Staff view
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary-700 truncate max-w-[160px] sm:max-w-none">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-primary-700 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
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
