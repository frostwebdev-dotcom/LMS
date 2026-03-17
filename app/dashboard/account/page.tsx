import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/auth/get-session";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export default async function AccountPage() {
  await requireUserOrRedirect();

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-primary-600 hover:text-primary-700 hover:underline"
        >
          Dashboard
        </Link>
        <span className="text-primary-400">/</span>
        <span className="font-medium text-primary-900">Account</span>
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
          Account settings
        </h1>
        <p className="mt-1 text-primary-700">
          Change your password and manage your account.
        </p>
      </header>

      <section
        className="rounded-xl border border-primary-200 bg-white p-4 sm:p-6"
        aria-labelledby="password-heading"
      >
        <h2 id="password-heading" className="text-lg font-semibold text-primary-900 mb-4">
          Change password
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
