import { createClient } from "@/lib/supabase/server";
import type { TrainingCategory, TrainingModule } from "@/types/database";

export const TRAINING_MODULE_CATEGORY_EMBED =
  "category:training_categories!training_modules_category_id_fkey(id, name, slug, description, icon, display_order, is_active, created_at, updated_at)";

export function normalizeModuleCategoryRow<T extends TrainingModule>(row: T): T {
  const raw = row.category;
  const category: TrainingCategory | null | undefined = Array.isArray(raw)
    ? (raw[0] as TrainingCategory | undefined) ?? null
    : raw;
  return { ...row, category: category ?? null };
}

export interface ModuleWithProgress extends TrainingModule {
  progress_completed_at: string | null;
  content_count: number;
  quiz_count: number;
}

export async function getPublishedModules(userId: string): Promise<ModuleWithProgress[]> {
  const supabase = await createClient();
  const { data: rawModules, error: modError } = await supabase
    .from("training_modules")
    .select(`*, ${TRAINING_MODULE_CATEGORY_EMBED}`)
    .order("sort_order", { ascending: true });
  const modules = (rawModules ?? []).map((r) => normalizeModuleCategoryRow(r as TrainingModule));

  if (modError) throw new Error(modError.message);
  if (!modules?.length) return [];

  const { data: progress } = await supabase
    .from("user_module_progress")
    .select("module_id, completed_at")
    .eq("user_id", userId);

  const progressMap = new Map(
    (progress ?? []).map((p) => [p.module_id, p.completed_at])
  );

  const moduleIds = modules.map((m) => m.id);
  const [contentCountByModule, quizCountByModule] = await Promise.all([
    getContentCountByModule(supabase, moduleIds),
    getQuizCountByModule(supabase, moduleIds),
  ]);

  return modules.map((m) => ({
    ...m,
    progress_completed_at: progressMap.get(m.id) ?? null,
    content_count: contentCountByModule.get(m.id) ?? 0,
    quiz_count: quizCountByModule.get(m.id) ?? 0,
  })) as ModuleWithProgress[];
}

async function getContentCountByModule(
  supabase: Awaited<ReturnType<typeof createClient>>,
  moduleIds: string[]
): Promise<Map<string, number>> {
  const { data } = await supabase
    .from("training_lessons")
    .select("module_id")
    .in("module_id", moduleIds);
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    map.set(row.module_id, (map.get(row.module_id) ?? 0) + 1);
  }
  return map;
}

async function getQuizCountByModule(
  supabase: Awaited<ReturnType<typeof createClient>>,
  moduleIds: string[]
): Promise<Map<string, number>> {
  const { data } = await supabase
    .from("quizzes")
    .select("module_id")
    .in("module_id", moduleIds);
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    map.set(row.module_id, (map.get(row.module_id) ?? 0) + 1);
  }
  return map;
}

export async function getAllModulesForAdmin(): Promise<TrainingModule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_modules")
    .select(`*, ${TRAINING_MODULE_CATEGORY_EMBED}`)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => normalizeModuleCategoryRow(r as TrainingModule));
}

export async function getModuleById(moduleId: string): Promise<TrainingModule | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_modules")
    .select(`*, ${TRAINING_MODULE_CATEGORY_EMBED}`)
    .eq("id", moduleId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return normalizeModuleCategoryRow(data as TrainingModule);
}

export async function getModuleForStaff(moduleId: string): Promise<TrainingModule | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_modules")
    .select(`*, ${TRAINING_MODULE_CATEGORY_EMBED}`)
    .eq("id", moduleId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return normalizeModuleCategoryRow(data as TrainingModule);
}
