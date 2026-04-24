"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { ACCOUNT_PATH, ADMIN_ROUTE_PREFIX, STAFF_ROUTE_PREFIX } from "@/lib/auth/config";
import { getUserDisplayName, getUserInitials } from "@/lib/user-header";
import type { UserRole } from "@/types/database";

export interface UserAccountMenuProps {
  email: string;
  fullName: string | null;
  role: UserRole;
  /** Dashboard: link to admin console */
  showAdminLink?: boolean;
  /** Staff dashboard: link to completed-module certificates */
  showCertificatesLink?: boolean;
  /** Admin shell: link back to staff dashboard */
  showStaffViewLink?: boolean;
}

function IconUser(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={props.className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconShield(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={props.className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconArrowRight(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={props.className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function IconLogout(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={props.className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 9l3 3m0 0l-3 3m3-3H9" />
    </svg>
  );
}

function IconChevron(props: { className?: string; open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={`${props.className ?? ""} transition-transform duration-200 ${props.open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

const menuItemClass =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-primary-800 transition hover:bg-primary-50 focus:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";

export function UserAccountMenu({
  email,
  fullName,
  role,
  showAdminLink = false,
  showCertificatesLink = false,
  showStaffViewLink = false,
}: UserAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const displayName = getUserDisplayName(fullName, email);
  const initials = getUserInitials(fullName, email);
  const roleLabel = role === "admin" ? "Administrator" : "Staff";

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        id={`${panelId}-trigger`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2 rounded-full border border-primary-200/80 bg-white py-1 pl-1 pr-2 shadow-sm transition hover:border-primary-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-xs font-semibold uppercase tracking-wide text-white shadow-inner ring-2 ring-white"
          aria-hidden
        >
          {initials}
        </span>
        <span className="hidden max-w-[140px] truncate text-left text-sm font-medium text-primary-900 sm:block">
          {displayName}
        </span>
        <IconChevron className="h-4 w-4 text-primary-500" open={open} />
      </button>

      {open && (
        <div
          id={panelId}
          role="menu"
          aria-labelledby={`${panelId}-trigger`}
          className="absolute right-0 z-[60] mt-2 w-[min(100vw-2rem,20rem)] origin-top-right rounded-xl border border-primary-200/90 bg-white py-2 shadow-xl shadow-primary-900/10 ring-1 ring-black/5"
        >
          <div className="border-b border-primary-100 px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-sm font-semibold text-white shadow-inner">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-primary-900">{displayName}</p>
                <p className="truncate text-xs text-primary-600" title={email}>
                  {email}
                </p>
                <span
                  className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    role === "admin"
                      ? "bg-accent-100 text-accent-800 ring-1 ring-accent-200/80"
                      : "bg-primary-100 text-primary-800 ring-1 ring-primary-200/80"
                  }`}
                >
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="p-1.5" role="none">
            <Link href={ACCOUNT_PATH} role="menuitem" className={menuItemClass} onClick={close}>
              <IconUser className="h-5 w-5 shrink-0 text-primary-600" />
              <span>Account and security</span>
            </Link>
            {showCertificatesLink && (
              <Link href="/dashboard/certificates" role="menuitem" className={menuItemClass} onClick={close}>
                <IconShield className="h-5 w-5 shrink-0 text-primary-600" />
                <span>My certificates</span>
              </Link>
            )}
            {showAdminLink && (
              <Link href={ADMIN_ROUTE_PREFIX} role="menuitem" className={menuItemClass} onClick={close}>
                <IconShield className="h-5 w-5 shrink-0 text-primary-600" />
                <span>Admin console</span>
              </Link>
            )}
            {showStaffViewLink && (
              <Link href={STAFF_ROUTE_PREFIX} role="menuitem" className={menuItemClass} onClick={close}>
                <IconArrowRight className="h-5 w-5 shrink-0 text-accent-600" />
                <span>Staff training portal</span>
              </Link>
            )}
          </div>

          <div className="border-t border-primary-100 p-1.5" role="none">
            <form action={signOut} className="w-full">
              <button type="submit" role="menuitem" className={`${menuItemClass} text-primary-900`}>
                <IconLogout className="h-5 w-5 shrink-0 text-primary-600" />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
