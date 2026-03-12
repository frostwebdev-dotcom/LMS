import { createClient } from "@/lib/supabase/server";

export interface StaffProgressRow {
  user_id: string;
  email: string;
  full_name: string | null;
  module_id: string;
  module_title: string;
  module_completed_at: string | null;
  content_completed_count: number;
  content_total_count: number;
  quiz_best_score: number | null;
  quiz_passed: boolean | null;
}

export async function getStaffProgress(): Promise<StaffProgressRow[]> {
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
    .select("id, title")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (!modules?.length) return [];

  const staffIds = profiles.map((p) => p.id);
  const moduleIds = modules.map((m) => m.id);

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
  for (const profile of profiles) {
    for (const mod of modules) {
      const modId = mod.id;
      const modTitle = mod.title;
      const completedAt = moduleProgressMap.get(`${profile.id}:${modId}`) ?? null;
      const contentTotal = contentByModuleCount.get(modId) ?? 0;
      const contentIds = contentIdsByModuleList.get(modId) ?? [];
      let contentCompleted = 0;
      for (const cid of contentIds) {
        if (contentProgressSet.has(`${profile.id}:${cid}`)) contentCompleted++;
      }
      const quizInfo = bestQuizByUserModule.get(`${profile.id}:${modId}`);
      rows.push({
        user_id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        module_id: modId,
        module_title: modTitle,
        module_completed_at: completedAt,
        content_completed_count: contentCompleted,
        content_total_count: contentTotal,
        quiz_best_score: quizInfo?.score ?? null,
        quiz_passed: quizInfo?.passed ?? null,
      });
    }
  }
  return rows;
}
