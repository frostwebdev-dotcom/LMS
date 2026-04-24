"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/get-session";
import { createClient } from "@/lib/supabase/server";
import { toUserFriendlyError } from "@/lib/actions/errors";
import {
  createTrainingCategorySchema,
  updateTrainingCategorySchema,
} from "@/lib/validations/training-categories";

export type TrainingCategoryActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

function parseCategoryForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    display_order: formData.get("display_order"),
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
  };
}

export async function createTrainingCategoryAction(
  _prev: unknown,
  formData: FormData
): Promise<TrainingCategoryActionResult> {
  await requireAdmin();
  const parsed = createTrainingCategorySchema.safeParse(parseCategoryForm(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_categories")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      icon: parsed.data.icon,
      display_order: parsed.data.display_order,
      is_active: parsed.data.is_active,
    })
    .select("id")
    .single();
  if (error) return { success: false, error: toUserFriendlyError(error.message) };
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/modules");
  return { success: true, id: data?.id };
}

export async function updateTrainingCategoryAction(
  categoryId: string,
  _prev: unknown,
  formData: FormData
): Promise<TrainingCategoryActionResult> {
  await requireAdmin();
  const parsed = updateTrainingCategorySchema.safeParse(parseCategoryForm(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("training_categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      icon: parsed.data.icon,
      display_order: parsed.data.display_order,
      is_active: parsed.data.is_active,
    })
    .eq("id", categoryId);
  if (error) return { success: false, error: toUserFriendlyError(error.message) };
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}/edit`);
  revalidatePath("/admin/modules");
  return { success: true };
}
