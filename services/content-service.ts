import { createClient } from "@/lib/supabase/server";
import { TRAINING_CONTENT_BUCKET } from "@/lib/storage/constants";
import type { ModuleContent } from "@/types/database";

export async function getContentByModuleId(moduleId: string): Promise<ModuleContent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_lessons")
    .select("*")
    .eq("module_id", moduleId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    content_type: row.lesson_type ?? row.content_type,
  })) as ModuleContent[];
}

export async function getContentById(contentId: string): Promise<ModuleContent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_lessons")
    .select("*")
    .eq("id", contentId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  const row = data as Record<string, unknown>;
  return { ...row, content_type: row.lesson_type ?? row.content_type } as ModuleContent;
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(TRAINING_CONTENT_BUCKET)
    .createSignedUrl(storagePath, 3600);
  if (error) throw new Error(error.message);
  if (!data?.signedUrl) throw new Error("Failed to create signed URL");
  return data.signedUrl;
}
