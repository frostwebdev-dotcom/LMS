import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { AUTH_SIGNUP_PATH, AUTH_FORGOT_PASSWORD_PATH } from "@/lib/auth/config";
import { Logo } from "@/components/layout/Logo";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; error?: string; success?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectTo, error: errorMessage, success: successMessage } = await searchParams;
  const showPasswordResetSuccess = successMessage === "password-reset";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-50/50 to-white">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          <Logo height={48} className="mb-4" />
          <h1 className="sr-only">Harmony Hearts Homecare</h1>
          <p className="text-primary-700 mt-1">Sign in to the training portal</p>
        </div>
        <div className="rounded-xl border border-primary-200 bg-white p-6 shadow-sm">
          {showPasswordResetSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 mb-4" role="status">
              Your password has been reset. Sign in with your new password.
            </div>
          )}
          <AuthForm mode="signin" redirectTo={redirectTo ?? undefined} error={errorMessage ?? undefined} />
          <p className="mt-3 text-center">
            <Link href={AUTH_FORGOT_PASSWORD_PATH} className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded">
              Forgot password?
            </Link>
          </p>
        </div>
        <p className="text-center text-sm text-primary-700">
          No account?{" "}
          <Link href={AUTH_SIGNUP_PATH} className="font-medium text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
