import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/get-session";
import { AUTH_LOGIN_PATH, STAFF_DEFAULT_PATH } from "@/lib/auth/config";

/**
 * Quizzes route: entry point for quiz-related views.
 * Staff see quizzes in context of each module (dashboard/modules/[id]/quiz).
 * This page redirects authenticated users to dashboard.
 */
export default async function QuizzesPage() {
  const user = await getSessionUser();
  if (!user) redirect(AUTH_LOGIN_PATH);
  redirect(STAFF_DEFAULT_PATH);
}
