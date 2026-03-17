import { createClient } from "@/lib/supabase/server";

export interface ModuleAssignments {
  userIds: string[];
  roleIds: string[];
}

/**
 * Fetches current module assignments (user and role) for a module.
 * Call from admin context only (RLS restricts to admin).
 */
export async function getModuleAssignments(
  moduleId: string
): Promise<ModuleAssignments> {
  const supabase = await createClient();
  const [userRes, roleRes] = await Promise.all([
    supabase
      .from("module_user_assignments")
      .select("user_id")
      .eq("module_id", moduleId),
    supabase
      .from("module_role_assignments")
      .select("role_id")
      .eq("module_id", moduleId),
  ]);
  if (userRes.error) throw new Error(userRes.error.message);
  if (roleRes.error) throw new Error(roleRes.error.message);
  return {
    userIds: (userRes.data ?? []).map((r) => r.user_id),
    roleIds: (roleRes.data ?? []).map((r) => r.role_id),
  };
}

/**
 * Replaces user assignments for a module. Call from admin context.
 */
export async function setModuleUserAssignments(
  moduleId: string,
  userIds: string[]
): Promise<void> {
  const supabase = await createClient();
  const { error: delError } = await supabase
    .from("module_user_assignments")
    .delete()
    .eq("module_id", moduleId);
  if (delError) throw new Error(delError.message);
  if (userIds.length === 0) return;
  const rows = userIds.map((user_id) => ({ module_id: moduleId, user_id }));
  const { error: insError } = await supabase
    .from("module_user_assignments")
    .insert(rows);
  if (insError) throw new Error(insError.message);
}

/**
 * Replaces role assignments for a module. Call from admin context.
 */
export async function setModuleRoleAssignments(
  moduleId: string,
  roleIds: string[]
): Promise<void> {
  const supabase = await createClient();
  const { error: delError } = await supabase
    .from("module_role_assignments")
    .delete()
    .eq("module_id", moduleId);
  if (delError) throw new Error(delError.message);
  if (roleIds.length === 0) return;
  const rows = roleIds.map((role_id) => ({ module_id: moduleId, role_id }));
  const { error: insError } = await supabase
    .from("module_role_assignments")
    .insert(rows);
  if (insError) throw new Error(insError.message);
}
