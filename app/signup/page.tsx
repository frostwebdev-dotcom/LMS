import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { AUTH_LOGIN_PATH } from "@/lib/auth/config";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Harmony Hearts Homecare</h1>
          <p className="text-slate-600 mt-1">Create an account</p>
        </div>
        <AuthForm mode="signup" />
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href={AUTH_LOGIN_PATH} className="text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
