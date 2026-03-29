"use client";

import { Logo } from "@/components/layout/Logo";
import { UserAccountMenu } from "@/components/layout/UserAccountMenu";
import type { UserAccountMenuProps } from "@/components/layout/UserAccountMenu";

export type DashboardAppHeaderProps = {
  user: Pick<UserAccountMenuProps, "email" | "fullName" | "role">;
  showAdminLink: boolean;
};

export function DashboardAppHeader({ user, showAdminLink }: DashboardAppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-primary-200/90 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex max-w-6xl min-h-14 items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Logo href="/dashboard" height={36} />
        <UserAccountMenu
          email={user.email}
          fullName={user.fullName}
          role={user.role}
          showAdminLink={showAdminLink}
        />
      </div>
    </header>
  );
}
