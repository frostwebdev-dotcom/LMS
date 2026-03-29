import Link from "next/link";
import { Logo } from "./Logo";

interface HeaderProps {
  /** Optional user display name or email */
  userDisplay?: string | null;
  /** Show "Admin" link when true (role-based) */
  showAdminLink?: boolean;
}

export function Header({ userDisplay, showAdminLink }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-primary-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href="/dashboard" height={36} />
        <nav className="flex items-center gap-3 sm:gap-4" aria-label="User menu">
          {userDisplay && (
            <span className="text-sm text-primary-700 truncate max-w-[140px] sm:max-w-none">{userDisplay}</span>
          )}
          {showAdminLink && (
            <Link href="/admin" className="text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1">
              Admin
            </Link>
          )}
          {/* In app: use <form action={signOut}> from app/actions/auth */}
          <span className="text-sm text-primary-600">Sign out</span>
        </nav>
      </div>
    </header>
  );
}
