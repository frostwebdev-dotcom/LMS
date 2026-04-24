"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { UserAccountMenu } from "@/components/layout/UserAccountMenu";
import type { UserAccountMenuProps } from "@/components/layout/UserAccountMenu";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/modules", label: "Modules" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/assignments", label: "Assignments" },
  { href: "/admin/progress", label: "Staff progress" },
  { href: "/admin/certificates", label: "Certificates" },
  { href: "/admin/users", label: "Users" },
] as const;

function IconMenu(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={props.className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function IconClose(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={props.className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export type AdminAppHeaderProps = {
  user: Pick<UserAccountMenuProps, "email" | "fullName" | "role">;
};

function adminNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminAppHeader({ user }: AdminAppHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileBtnId = useId();
  const mobilePanelId = useId();
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-primary-200/90 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
      <div className="relative z-[70] mx-auto flex max-w-[1600px] min-h-14 items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Logo href="/admin" height={36} className="shrink-0" />

          <nav className="hidden min-w-0 md:flex md:items-center md:gap-1 lg:gap-2" aria-label="Admin menu">
            {ADMIN_NAV.map(({ href, label }) => {
              const active = adminNavLinkActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                    active
                      ? "bg-primary-100 text-primary-900"
                      : "text-primary-700 hover:bg-primary-50 hover:text-primary-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold text-accent-700 transition hover:bg-accent-50 hover:text-accent-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              Staff view
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            id={mobileBtnId}
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-primary-200 bg-white p-2 text-primary-800 shadow-sm transition hover:bg-primary-50 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls={mobilePanelId}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>

          <UserAccountMenu
            email={user.email}
            fullName={user.fullName}
            role={user.role}
            showStaffViewLink
          />
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed left-0 right-0 top-14 bottom-0 z-[55] bg-primary-900/40 backdrop-blur-sm md:hidden"
            aria-hidden
            onClick={closeMobile}
          />
          <div
            id={mobilePanelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${mobileBtnId}-title`}
            className="fixed left-0 right-0 top-14 z-[60] max-h-[min(85vh,calc(100dvh-3.5rem))] overflow-y-auto rounded-b-2xl border-b border-primary-200 bg-white shadow-2xl md:hidden"
          >
            <div className="flex items-center justify-between border-b border-primary-100 px-4 py-3">
              <p id={`${mobileBtnId}-title`} className="text-sm font-semibold text-primary-900">
                Admin navigation
              </p>
              <button
                type="button"
                className="rounded-lg p-2 text-primary-600 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Close menu"
                onClick={closeMobile}
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col p-2 pb-6" aria-label="Admin menu mobile">
              {ADMIN_NAV.map(({ href, label }) => {
                const active = adminNavLinkActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-xl px-4 py-3 text-base font-medium hover:bg-primary-50 ${
                      active ? "bg-primary-100 text-primary-900" : "text-primary-800"
                    }`}
                    onClick={closeMobile}
                  >
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/dashboard"
                className="rounded-xl px-4 py-3 text-base font-semibold text-accent-800 hover:bg-accent-50"
                onClick={closeMobile}
              >
                Staff training portal
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
