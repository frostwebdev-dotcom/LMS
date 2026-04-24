import { createClient } from "@/lib/supabase/server";
import type { TrainingCategory } from "@/types/database";

/**
 * Single category by id (admin edit). Returns null if missing.
 */
export async function getTrainingCategoryById(categoryId: string): Promise<TrainingCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_categories")
    .select("id, name, slug, description, icon, display_order, is_active, created_at, updated_at")
    .eq("id", categoryId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as TrainingCategory;
}

/** Count of training_modules per category_id (for admin lists). */
export async function getModuleCountByCategoryId(): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("training_modules").select("category_id");
  if (error) throw new Error(error.message);
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const id = (row as { category_id: string }).category_id;
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

/**
 * All categories for admin UIs (including inactive).
 */
export async function getTrainingCategoriesForAdmin(): Promise<TrainingCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_categories")
    .select("id, name, slug, description, icon, display_order, is_active, created_at, updated_at")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as TrainingCategory[];
}

/**
 * Active categories for staff-facing filters and public metadata.
 */
export async function getActiveTrainingCategories(): Promise<TrainingCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_categories")
    .select("id, name, slug, description, icon, display_order, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as TrainingCategory[];
}
