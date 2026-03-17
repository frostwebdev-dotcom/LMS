import { createClient } from "@/lib/supabase/server";
import type { ExpirationStatus } from "@/types/dashboard";
import { computeExpiration } from "@/lib/expiration";

export interface StaffProgressRow {
  user_id: string;
  email: string;
  full_name: string | null;
  module_id: string;
  module_title: string;
  /** 0–100. Lessons + quiz (if any) count as steps. */
  progress_percent: number;
  quiz_best_score: number | null;
  quiz_passed: boolean | null;
  /** When the module was completed (all lessons + quiz passed); null otherwise. */
  module_completed_at: string | null;
  content_completed_count: number;
  content_total_count: number;
  /** Whether this module has a quiz (affects progress calculation). */
  has_quiz: boolean;
  /** Expiration: valid, expiring_soon, expired. Set when completed; null otherwise. */
  expiration_status: ExpirationStatus | null;
  /** Days remaining (negative = days since expired). Set when completed; null otherwise. */
  expiration_days_remaining: number | null;
  /** ISO date when training expires. Set when completed; null otherwise. */
  expiration_expires_at: string | null;
}

export interface StaffProgressFilters {
  /** Filter by staff user id. */
  staffId?: string;
  /** Filter by module id. */
  moduleId?: string;
}

/**
 * Fetches staff training progress from Supabase. No mock data.
 * Optionally filter by staffId and/or moduleId.
 */
export async function getStaffProgress(
  filters?: StaffProgressFilters
): Promise<StaffProgressRow[]> {
  const supabase = await createClient();

  const { data: staffRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "staff")
    .single();
  if (!staffRole?.id) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("role_id", staffRole.id);
  if (!profiles?.length) return [];

  const { data: modules } = await supabase
    .from("training_modules")
    .select("id, title, expiration_months")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (!modules?.length) return [];

  let staffIds = profiles.map((p) => p.id);
  let moduleIds = modules.map((m) => m.id);
  if (filters?.staffId) staffIds = staffIds.filter((id) => id === filters.staffId);
  if (filters?.moduleId) moduleIds = moduleIds.filter((id) => id === filters.moduleId);
  if (staffIds.length === 0 || moduleIds.length === 0) return [];

  const [moduleProgress, contentProgress, quizAttempts] = await Promise.all([
    supabase
      .from("user_module_progress")
      .select("user_id, module_id, completed_at")
      .in("user_id", staffIds)
      .in("module_id", moduleIds),
    supabase
      .from("user_lesson_progress")
      .select("user_id, lesson_id")
      .in("user_id", staffIds)
      .not("completed_at", "is", null),
    supabase
      .from("quiz_attempts")
      .select("user_id, quiz_id, score_percent, passed")
      .in("user_id", staffIds),
  ]);

  const { data: quizToModule } = await supabase
    .from("quizzes")
    .select("id, module_id")
    .in("module_id", moduleIds);

  const { data: contentRows } = await supabase
    .from("training_lessons")
    .select("id, module_id")
    .in("module_id", moduleIds);
  const contentByModuleCount = new Map<string, number>();
  const contentIdsByModuleList = new Map<string, string[]>();
  for (const r of contentRows ?? []) {
    const row = r as { id: string; module_id: string };
    contentByModuleCount.set(
      row.module_id,
      (contentByModuleCount.get(row.module_id) ?? 0) + 1
    );
    const list = contentIdsByModuleList.get(row.module_id) ?? [];
    list.push(row.id);
    contentIdsByModuleList.set(row.module_id, list);
  }

  const moduleProgressMap = new Map<string, string | null>();
  for (const p of moduleProgress.data ?? []) {
    moduleProgressMap.set(`${p.user_id}:${p.module_id}`, p.completed_at);
  }
  const contentProgressSet = new Set(
    (contentProgress.data ?? []).map((p) => `${p.user_id}:${p.lesson_id}`)
  );
  const quizByModule = new Map<string, string>();
  for (const q of quizToModule ?? []) {
    quizByModule.set((q as { id: string; module_id: string }).module_id, (q as { id: string }).id);
  }
  const hasQuizByModule = new Set(quizByModule.keys());
  const bestQuizByUserModule = new Map<string, { score: number; passed: boolean }>();
  for (const a of quizAttempts.data ?? []) {
    const quizId = a.quiz_id;
    const moduleId = quizToModule?.find((q) => (q as { id: string }).id === quizId) as
      | { module_id: string }
      | undefined;
    if (!moduleId) continue;
    const key = `${a.user_id}:${moduleId.module_id}`;
    const existing = bestQuizByUserModule.get(key);
    if (!existing || a.score_percent > existing.score) {
      bestQuizByUserModule.set(key, { score: a.score_percent, passed: a.passed });
    }
  }

  const rows: StaffProgressRow[] = [];
  const staffSet = new Set(staffIds);
  const moduleSet = new Set(moduleIds);
  const profilesFiltered = profiles.filter((p) => staffSet.has(p.id));
  const modulesFiltered = modules.filter((m) => moduleSet.has(m.id));
  for (const profile of profilesFiltered) {
    for (const mod of modulesFiltered) {
      const modId = mod.id;
      const modTitle = mod.title;
      const expirationMonths = (mod as { expiration_months?: number | null }).expiration_months;
      const completedAt = moduleProgressMap.get(`${profile.id}:${modId}`) ?? null;
      const expiration = computeExpiration(completedAt, expirationMonths);
      const contentTotal = contentByModuleCount.get(modId) ?? 0;
      const contentIds = contentIdsByModuleList.get(modId) ?? [];
      let contentCompleted = 0;
      for (const cid of contentIds) {
        if (contentProgressSet.has(`${profile.id}:${cid}`)) contentCompleted++;
      }
      const quizInfo = bestQuizByUserModule.get(`${profile.id}:${modId}`);
      const hasQuiz = hasQuizByModule.has(modId);
      const totalSteps = contentTotal + (hasQuiz ? 1 : 0);
      const completedSteps =
        contentCompleted + (quizInfo?.passed ? 1 : 0);
      const progress_percent =
        totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      rows.push({
        user_id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        module_id: modId,
        module_title: modTitle,
        progress_percent,
        quiz_best_score: quizInfo?.score ?? null,
        quiz_passed: quizInfo?.passed ?? null,
        module_completed_at: completedAt,
        content_completed_count: contentCompleted,
        content_total_count: contentTotal,
        has_quiz: hasQuiz,
        expiration_status: expiration?.status ?? null,
        expiration_days_remaining: expiration?.daysRemaining ?? null,
        expiration_expires_at: expiration?.expiresAt ?? null,
      });
    }
  }
  return rows;
}

/** Options for progress filters (employee and module dropdowns). From Supabase. */
export interface StaffProgressFilterOptions {
  staff: { id: string; label: string }[];
  modules: { id: string; title: string }[];
}

export async function getStaffProgressFilterOptions(): Promise<StaffProgressFilterOptions> {
  const supabase = await createClient();
  const { data: staffRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "staff")
    .single();
  if (!staffRole?.id) {
    return { staff: [], modules: [] };
  }
  const [profilesRes, modulesRes] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name").eq("role_id", staffRole.id),
    supabase
      .from("training_modules")
      .select("id, title")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ]);
  const staffProfiles = (profilesRes.data ?? []) as {
    id: string;
    email: string;
    full_name: string | null;
  }[];
  const moduleList = (modulesRes.data ?? []) as { id: string; title: string }[];
  return {
    staff: staffProfiles.map((p) => ({
      id: p.id,
      label: p.full_name?.trim() || p.email || p.id,
    })),
    modules: moduleList.map((m) => ({ id: m.id, title: m.title })),
  };
}
