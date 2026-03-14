"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/get-session";
import {
  resetModuleProgressForAllUsers,
  resetUserModuleProgress,
} from "@/services/progress-reset-service";

export type ProgressResetResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Resets all staff progress for one module (e.g. annual training reset).
 * Admin only.
 */
export async function resetModuleProgressForAllAction(
  moduleId: string
): Promise<ProgressResetResult> {
  try {
    await requireAdmin();
    await resetModuleProgressForAllUsers(moduleId);
    revalidatePath("/admin/progress");
    revalidatePath(`/admin/modules/${moduleId}`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to reset progress",
    };
  }
}

/**
 * Resets one user's progress for one module. Admin only.
 */
export async function resetUserModuleProgressAction(
  userId: string,
  moduleId: string
): Promise<ProgressResetResult> {
  try {
    await requireAdmin();
    await resetUserModuleProgress(userId, moduleId);
    revalidatePath("/admin/progress");
    revalidatePath(`/admin/modules/${moduleId}`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to reset progress",
    };
  }
}

/** Form-callable: reads module_id from FormData and resets that module for all staff. */
export async function resetModuleProgressForAllActionForm(
  formData: FormData
): Promise<ProgressResetResult> {
  const moduleId = formData.get("module_id");
  if (typeof moduleId !== "string") return { success: false, error: "Missing module." };
  return resetModuleProgressForAllAction(moduleId);
}

/** Form-callable: reads user_id and module_id from FormData and resets that user's progress for the module. */
export async function resetUserModuleProgressActionForm(
  formData: FormData
): Promise<ProgressResetResult> {
  const userId = formData.get("user_id");
  const moduleId = formData.get("module_id");
  if (typeof userId !== "string" || typeof moduleId !== "string") {
    return { success: false, error: "Missing user or module." };
  }
  return resetUserModuleProgressAction(userId, moduleId);
}
