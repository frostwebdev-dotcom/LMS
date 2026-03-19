"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/get-session";
import { createClient } from "@/lib/supabase/server";
import { createContentSchema, updateContentSchema } from "@/lib/validations/content";
import { toUserFriendlyError } from "@/lib/actions/errors";
import { uploadLessonFile } from "@/lib/storage/upload-lesson-file";
import { TRAINING_CONTENT_BUCKET } from "@/lib/storage/constants";

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
  const contentType = formData.get("content_type") as "video" | "pdf" | "image" | "csv" | null;
  if (!file || !title || !contentType) {
    return { success: false, error: "Title, type, and file are required." };
  }
  const parsed = createContentSchema.safeParse({
    module_id: moduleId,
    title,
    content_type: contentType,
    sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : 0,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed." };
  }

  const supabase = await createClient();
  const uploadResult = await uploadLessonFile(
    supabase,
    moduleId,
    file,
    parsed.data.content_type
  );
  if (!uploadResult.success) {
    return {
      success: false,
      error: toUserFriendlyError(uploadResult.error),
    };
  }

  const { data, error } = await supabase
    .from("training_lessons")
    .insert({
      module_id: moduleId,
      title: parsed.data.title,
      lesson_type: parsed.data.content_type,
      storage_path: uploadResult.storagePath,
      sort_order: parsed.data.sort_order ?? 0,
    })
    .select("id")
    .single();
  if (error) return { success: false, error: toUserFriendlyError(error.message) };

  revalidatePath(`/admin/modules/${moduleId}`);
  return { success: true, id: data?.id };
}

/**
 * Saves a lesson after the file has been uploaded client-side to Supabase Storage.
 * Request body is small (metadata + path only), so it avoids the Server Action body size limit.
 */
export async function saveLessonFromUploadAction(payload: {
  moduleId: string;
  title: string;
  content_type: "video" | "pdf" | "image" | "csv";
  sort_order: number;
  storage_path: string;
}): Promise<ContentActionResult> {
  await requireAdmin();
  const parsed = createContentSchema.safeParse({
    module_id: payload.moduleId,
    title: payload.title.trim(),
    content_type: payload.content_type,
    sort_order: payload.sort_order,
    storage_path: payload.storage_path,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed." };
  }
  if (!parsed.data.storage_path || parsed.data.storage_path.length < 1) {
    return { success: false, error: "Storage path is required." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_lessons")
    .insert({
      module_id: parsed.data.module_id,
      title: parsed.data.title,
      lesson_type: parsed.data.content_type,
      storage_path: parsed.data.storage_path,
      sort_order: parsed.data.sort_order ?? 0,
    })
    .select("id")
    .single();
  if (error) return { success: false, error: toUserFriendlyError(error.message) };
  revalidatePath(`/admin/modules/${payload.moduleId}`);
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
  if (error) return { success: false, error: toUserFriendlyError(error.message) };
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
    await supabase.storage.from(TRAINING_CONTENT_BUCKET).remove([row.storage_path]);
  }
  const { error } = await supabase.from("training_lessons").delete().eq("id", contentId);
  if (error) return { success: false, error: toUserFriendlyError(error.message) };
  revalidatePath(`/admin/modules/${moduleId}`);
  return { success: true };
}

/** Form-callable wrapper for deleteContentAction (used from server-rendered forms). */
export async function deleteContentActionForm(formData: FormData): Promise<ContentActionResult> {
  const contentId = formData.get("contentId");
  const moduleId = formData.get("moduleId");
  if (typeof contentId !== "string" || typeof moduleId !== "string") {
    return { success: false, error: "Missing lesson or module." };
  }
  return deleteContentAction(contentId, moduleId);
}
