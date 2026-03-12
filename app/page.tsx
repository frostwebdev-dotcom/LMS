import Link from "next/link";
import { AUTH_LOGIN_PATH } from "@/lib/auth/config";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Harmony Hearts Homecare
      </h1>
      <p className="text-slate-600 mb-6">Training Portal</p>
      <Link
        href={AUTH_LOGIN_PATH}
        className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition"
      >
        Sign in
      </Link>
    </main>
  );
}
