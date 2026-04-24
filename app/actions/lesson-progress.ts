"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/get-session";
import { getContentById } from "@/services/content-service";
import { updateModuleCompletionIfEligible } from "@/services/module-completion-service";
import { markContentComplete } from "@/services/progress-service";

/**
 * Server action: mark a lesson as complete for the current user.
 * Used by the lesson viewer (client component) without passing functions as props.
 */
export async function markLessonCompleteAction(contentId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  await markContentComplete(user.id, contentId);

  const content = await getContentById(contentId);
  if (!content?.module_id) return;

  try {
    await updateModuleCompletionIfEligible(user.id, content.module_id);
  } catch (e) {
    console.error("[module-completion] after lesson complete:", e);
  }
  revalidatePath(`/dashboard/modules/${content.module_id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/certificates");
}
