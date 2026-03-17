"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/get-session";
import {
  getModuleAssignments,
  setModuleUserAssignments,
  setModuleRoleAssignments,
} from "@/services/module-assignment-service";

export type ModuleAssignmentsResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Updates which roles can see this module. Only admins. Replaces existing role assignments.
 */
export async function updateModuleRoleAssignmentsAction(
  moduleId: string,
  roleIds: string[]
): Promise<ModuleAssignmentsResult> {
  await requireAdmin();
  try {
    await setModuleRoleAssignments(moduleId, roleIds);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to update role assignments",
    };
  }
  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath("/admin/modules");
  return { success: true };
}

/**
 * Updates which users (employees) can see this module. Only admins. Replaces existing user assignments.
 */
export async function updateModuleUserAssignmentsAction(
  moduleId: string,
  userIds: string[]
): Promise<ModuleAssignmentsResult> {
  await requireAdmin();
  try {
    await setModuleUserAssignments(moduleId, userIds);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to update user assignments",
    };
  }
  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath("/admin/modules");
  return { success: true };
}

export { getModuleAssignments };
