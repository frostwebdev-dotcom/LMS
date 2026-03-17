import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AUTH_LOGIN_PATH } from "@/lib/auth/config";

export const metadata = {
  title: "Set new password",
  description: "Enter your new password to complete the reset.",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-50/50 to-white">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          <Logo height={48} className="mb-4" />
          <h1 className="sr-only">Set new password</h1>
          <p className="text-primary-700 mt-1">Enter your new password below</p>
        </div>
        <div className="rounded-xl border border-primary-200 bg-white p-6 shadow-sm">
          <ResetPasswordForm />
        </div>
        <p className="text-center text-sm text-primary-700">
          <Link href={AUTH_LOGIN_PATH} className="font-medium text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
