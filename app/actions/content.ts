"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/get-session";
import { createClient } from "@/lib/supabase/server";
import { createContentSchema, updateContentSchema } from "@/lib/validations/content";

const BUCKET = "training-content";

export type ContentActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

export async function uploadContentAction(
  moduleId: string,
  _prev: unknown,
  formData: FormData
): Promise<ContentActionResult> {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  const title = String(formData.get("title") ?? "").trim();
  const contentType = formData.get("content_type") as "video" | "pdf" | "presentation" | null;
  if (!file?.size || !title || !contentType) {
    return { success: false, error: "Title, type, and file are required" };
  }
  const parsed = createContentSchema.safeParse({
    module_id: moduleId,
    title,
    content_type: contentType,
    storage_path: "", // set after upload
    sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : 0,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${moduleId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });
  if (uploadError) return { success: false, error: uploadError.message };

  const { data, error } = await supabase
    .from("training_lessons")
    .insert({
      module_id: moduleId,
      title: parsed.data.title,
      lesson_type: parsed.data.content_type,
      storage_path: path,
      sort_order: parsed.data.sort_order ?? 0,
    })
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/modules/${moduleId}`);
  return { success: true, id: data?.id };
}

export async function updateContentAction(
  contentId: string,
  moduleId: string,
  _prev: unknown,
  formData: FormData
): Promise<ContentActionResult> {
  await requireAdmin();
  const parsed = updateContentSchema.safeParse({
    title: formData.get("title") ?? undefined,
    content_type: formData.get("content_type") ?? undefined,
    storage_path: formData.get("storage_path") ?? undefined,
    sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }
  const supabase = await createClient();
  const updatePayload: Record<string, unknown> = { ...parsed.data };
  if ("content_type" in updatePayload) {
    updatePayload.lesson_type = updatePayload.content_type;
    delete updatePayload.content_type;
  }
  const { error } = await supabase
    .from("training_lessons")
    .update(updatePayload)
    .eq("id", contentId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/modules/${moduleId}`);
  return { success: true };
}

export async function deleteContentAction(
  contentId: string,
  moduleId: string
): Promise<ContentActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("training_lessons")
    .select("storage_path")
    .eq("id", contentId)
    .single();
  if (row?.storage_path) {
    await supabase.storage.from(BUCKET).remove([row.storage_path]);
  }
  const { error } = await supabase.from("training_lessons").delete().eq("id", contentId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/modules/${moduleId}`);
  return { success: true };
}
