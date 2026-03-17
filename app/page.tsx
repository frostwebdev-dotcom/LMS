import Link from "next/link";
import { AUTH_LOGIN_PATH } from "@/lib/auth/config";
import { Logo } from "@/components/layout/Logo";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-50/50 to-white">
      <Logo height={56} className="mb-2" />
      <h1 className="sr-only">Harmony Hearts Homecare</h1>
      <p className="text-primary-700 mb-6">Training Portal</p>
      <Link
        href={AUTH_LOGIN_PATH}
        className="rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition"
      >
        Sign in
      </Link>
    </main>
  );
}
