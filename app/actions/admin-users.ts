"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClientServiceRole } from "@/lib/supabase/service-role-server";
import { requireAdmin } from "@/lib/auth/get-session";
import { createUserSchema, updateRoleSchema, deleteUserSchema } from "@/lib/validations/admin-users";

export type AdminUserActionResult =
  | { success: true }
  | { success: false; error: string };

export async function updateUserRoleAction(
  profileId: string,
  formData: FormData
): Promise<AdminUserActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden." };
  }
  const roleId = formData.get("roleId")?.toString() ?? "";
  const parsed = updateRoleSchema.safeParse({ profileId, roleId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role_id: parsed.data.roleId })
    .eq("id", parsed.data.profileId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function createUserAction(
  _prev: AdminUserActionResult | null,
  formData: FormData
): Promise<AdminUserActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden." };
  }
  const parsed = createUserSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    fullName: formData.get("fullName")?.toString() || undefined,
    role: formData.get("role") === "admin" ? "admin" : "staff",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const supabase = createClientServiceRole();
  const { data, error } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName ?? parsed.data.email,
      role: parsed.data.role,
    },
  });
  if (error) {
    if (error.message?.includes("already") || /already registered|exists/i.test(error.message)) {
      return { success: false, error: "This email is already registered." };
    }
    return { success: false, error: error.message };
  }
  if (!data.user) return { success: false, error: "User could not be created." };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUserAction(userId: string): Promise<AdminUserActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden." };
  }
  const parsed = deleteUserSchema.safeParse({ userId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const supabase = createClientServiceRole();
  const { error } = await supabase.auth.admin.deleteUser(parsed.data.userId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}
