"use server";

import { getSessionUser } from "@/lib/auth/get-session";
import { markContentComplete } from "@/services/progress-service";

/**
 * Server action: mark a lesson as complete for the current user.
 * Used by the lesson viewer (client component) without passing functions as props.
 */
export async function markLessonCompleteAction(contentId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  await markContentComplete(user.id, contentId);
}
