import { createClient } from "@/lib/supabase/server";
import type { AdminDashboardStats, ComplianceCounts } from "@/types/admin-dashboard";
import { computeExpiration } from "@/lib/expiration";

/**
 * Fetches admin dashboard summary stats from Supabase. No mock data.
 * - totalStaff: staff role users
 * - totalModules: all training modules
 * - completedModules: total user-module completions (user_module_progress with completed_at)
 * - inProgressTraining: (staff, published module) pairs with some progress but not completed
 * - compliance: counts of completed trainings by status (valid, expiring soon, expired)
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();

  const [staffRole, modulesResult, progressResult, inProgressCount, compliance] =
    await Promise.all([
      getStaffCount(supabase),
      getModuleCount(supabase),
      getCompletedModuleCount(supabase),
      getInProgressTrainingCount(supabase),
      getComplianceCounts(supabase),
    ]);

  return {
    totalStaff: staffRole,
    totalModules: modulesResult,
    completedModules: progressResult,
    inProgressTraining: inProgressCount,
    compliance,
  };
}

async function getComplianceCounts(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<ComplianceCounts> {
  const { data: rows } = await supabase
    .from("user_module_progress")
    .select("module_id, completed_at")
    .not("completed_at", "is", null);
  if (!rows?.length) return { valid: 0, expiringSoon: 0, expired: 0 };

  const moduleIds = [...new Set((rows as { module_id: string }[]).map((r) => r.module_id))];
  const { data: modules } = await supabase
    .from("training_modules")
    .select("id, expiration_months")
    .in("id", moduleIds);
  const expirationByModule = new Map(
    (modules ?? []).map((m) => [m.id, (m as { expiration_months?: number | null }).expiration_months])
  );

  let valid = 0;
  let expiringSoon = 0;
  let expired = 0;
  for (const row of rows as { module_id: string; completed_at: string }[]) {
    const exp = computeExpiration(row.completed_at, expirationByModule.get(row.module_id));
    if (!exp) continue;
    if (exp.status === "valid") valid++;
    else if (exp.status === "expiring_soon") expiringSoon++;
    else expired++;
  }
  return { valid, expiringSoon, expired };
}

async function getStaffCount(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<number> {
  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "staff")
    .single();
  if (!role?.id) return 0;
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role_id", role.id);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function getModuleCount(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<number> {
  const { count, error } = await supabase
    .from("training_modules")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function getCompletedModuleCount(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<number> {
  const { count, error } = await supabase
    .from("user_module_progress")
    .select("id", { count: "exact", head: true })
    .not("completed_at", "is", null);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Count (staff user, published module) pairs where the user has started
 * (lesson progress or quiz attempt) but not completed the module.
 */
async function getInProgressTrainingCount(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<number> {
  const { data: staffRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "staff")
    .single();
  if (!staffRole?.id) return 0;

  const { data: staff } = await supabase
    .from("profiles")
    .select("id")
    .eq("role_id", staffRole.id);
  const staffIds = (staff ?? []).map((p) => p.id);
  if (staffIds.length === 0) return 0;

  const { data: publishedModules } = await supabase
    .from("training_modules")
    .select("id")
    .eq("is_published", true);
  const moduleIds = (publishedModules ?? []).map((m) => m.id);
  if (moduleIds.length === 0) return 0;

  const [
    { data: completed },
    { data: lessons },
    { data: quizzes },
    { data: lessonRows },
    { data: attemptRows },
  ] = await Promise.all([
    supabase
      .from("user_module_progress")
      .select("user_id, module_id")
      .in("user_id", staffIds)
      .in("module_id", moduleIds)
      .not("completed_at", "is", null),
    supabase
      .from("training_lessons")
      .select("id, module_id")
      .in("module_id", moduleIds),
    supabase.from("quizzes").select("id, module_id").in("module_id", moduleIds),
    supabase
      .from("user_lesson_progress")
      .select("user_id, lesson_id")
      .in("user_id", staffIds)
      .not("completed_at", "is", null),
    supabase
      .from("quiz_attempts")
      .select("user_id, quiz_id")
      .in("user_id", staffIds),
  ]);

  const completedSet = new Set(
    (completed ?? []).map((r) => `${r.user_id}:${r.module_id}`)
  );
  const lessonToModule = new Map(
    (lessons ?? []).map((l) => [l.id, l.module_id])
  );
  const quizToModule = new Map((quizzes ?? []).map((q) => [q.id, q.module_id]));

  const startedSet = new Set<string>();
  for (const r of lessonRows ?? []) {
    const moduleId = lessonToModule.get(r.lesson_id);
    if (moduleId) startedSet.add(`${r.user_id}:${moduleId}`);
  }
  for (const r of attemptRows ?? []) {
    const moduleId = quizToModule.get(r.quiz_id);
    if (moduleId) startedSet.add(`${r.user_id}:${moduleId}`);
  }

  let count = 0;
  for (const key of startedSet) {
    if (!completedSet.has(key)) count++;
  }
  return count;
}
