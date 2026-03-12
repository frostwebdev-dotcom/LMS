import Link from "next/link";

interface HeaderProps {
  /** Optional user display name or email */
  userDisplay?: string | null;
  /** Show "Admin" link when true (role-based) */
  showAdminLink?: boolean;
}

export function Header({ userDisplay, showAdminLink }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="font-semibold text-slate-800">
          Harmony Hearts Training
        </Link>
        <nav className="flex items-center gap-4">
          {userDisplay && (
            <span className="text-sm text-slate-600">{userDisplay}</span>
          )}
          {showAdminLink && (
            <Link href="/admin" className="text-sm text-primary-600 hover:underline">
              Admin
            </Link>
          )}
          {/* In app: use <form action={signOut}> from app/actions/auth */}
          <span className="text-sm text-slate-500">Sign out</span>
        </nav>
      </div>
    </header>
  );
}
