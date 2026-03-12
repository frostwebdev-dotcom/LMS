import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { AUTH_SIGNUP_PATH } from "@/lib/auth/config";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectTo, error: errorMessage } = await searchParams;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Harmony Hearts Homecare</h1>
          <p className="text-slate-600 mt-1">Sign in to the training portal</p>
        </div>
        <AuthForm mode="signin" redirectTo={redirectTo ?? undefined} error={errorMessage ?? undefined} />
        <p className="text-center text-sm text-slate-600">
          No account?{" "}
          <Link href={AUTH_SIGNUP_PATH} className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
