import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import { signOut } from "@/app/actions/auth";
import { STAFF_ROUTE_PREFIX } from "@/lib/auth/config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminOrRedirect();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold text-slate-800">
              Admin
            </Link>
            <Link href="/admin/modules" className="text-sm text-slate-600 hover:text-slate-900">
              Modules
            </Link>
            <Link href="/admin/progress" className="text-sm text-slate-600 hover:text-slate-900">
              Staff progress
            </Link>
            <Link href={STAFF_ROUTE_PREFIX} className="text-sm text-primary-600 hover:underline">
              Staff view
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-slate-600 hover:text-slate-900">
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
