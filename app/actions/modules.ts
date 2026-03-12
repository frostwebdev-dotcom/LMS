"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/get-session";
import { createClient } from "@/lib/supabase/server";
import { createModuleSchema, updateModuleSchema } from "@/lib/validations/modules";

export type ModuleActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

export async function createModuleAction(
  _prev: unknown,
  formData: FormData
): Promise<ModuleActionResult> {
  await requireAdmin();
  const parsed = createModuleSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") || null,
    sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : 0,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("training_modules")
    .insert({
      ...parsed.data,
      created_by: user.user?.id ?? null,
    })
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/modules");
  return { success: true, id: data?.id };
}

export async function updateModuleAction(
  moduleId: string,
  _prev: unknown,
  formData: FormData
): Promise<ModuleActionResult> {
  await requireAdmin();
  const parsed = updateModuleSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") || null,
    sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : undefined,
    is_published: formData.get("is_published") === "on" || formData.get("is_published") === "true",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("training_modules")
    .update(parsed.data)
    .eq("id", moduleId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/modules");
  revalidatePath(`/admin/modules/${moduleId}`);
  return { success: true };
}

export async function deleteModuleAction(formData: FormData): Promise<ModuleActionResult> {
  await requireAdmin();
  const moduleId = formData.get("moduleId");
  if (typeof moduleId !== "string") return { success: false, error: "Missing module" };
  const supabase = await createClient();
  const { error } = await supabase.from("training_modules").delete().eq("id", moduleId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/modules");
  redirect("/admin/modules");
}
