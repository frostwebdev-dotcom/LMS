import { createClient } from "@/lib/supabase/server";
import { computeExpiration } from "@/lib/expiration";
import type {
  StaffDashboardModule,
  ModuleProgressStatus,
  ModuleQuizResult,
} from "@/types/dashboard";

/**
 * Fetches all published (assigned/available) training modules for the given
 * staff user with status and progress percent. No mock data.
 * Module completion (progressCompletedAt) is set only when all required lessons
 * are viewed and the quiz is passed (see module-completion-service).
 */
export async function getStaffDashboardModules(
  userId: string
): Promise<StaffDashboardModule[]> {
  const supabase = await createClient();

  const { data: modules, error: modError } = await supabase
    .from("training_modules")
    .select("id, title, description, sort_order, estimated_duration_minutes, expiration_months")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (modError) throw new Error(modError.message);
  if (!modules?.length) return [];

  const moduleIds = modules.map((m) => m.id);

  const [
    moduleProgress,
    lessonIdsByModule,
    completedLessonIds,
    quizzesByModule,
    passedQuizIds,
    bestQuizAttemptByQuizId,
  ] = await Promise.all([
    getModuleProgressMap(supabase, userId, moduleIds),
    getLessonIdsByModule(supabase, moduleIds),
    getCompletedLessonIds(supabase, userId, moduleIds),
    getQuizzesByModule(supabase, moduleIds),
    getPassedQuizIds(supabase, userId, moduleIds),
    getBestQuizAttemptByQuizId(supabase, userId, moduleIds),
  ]);

  return modules.map((m) => {
    const progressCompletedAt = moduleProgress.get(m.id) ?? null;
    const lessonIds = lessonIdsByModule.get(m.id) ?? [];
    const completedLessons = lessonIds.filter((id) => completedLessonIds.has(id));
    const quiz = quizzesByModule.get(m.id);
    const quizPassed = quiz ? passedQuizIds.has(quiz.id) : false;

    const totalSteps =
      lessonIds.length + (quiz ? 1 : 0);
    const completedSteps =
      completedLessons.length + (quizPassed ? 1 : 0);
    const progressPercent =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    const status: ModuleProgressStatus =
      progressCompletedAt || progressPercent === 100
        ? "completed"
        : progressPercent > 0
          ? "in_progress"
          : "not_started";

    const contentCount = lessonIds.length;
    const quizCount = quiz ? 1 : 0;
    const quizResult: ModuleQuizResult | null =
      quiz && bestQuizAttemptByQuizId.has(quiz.id)
        ? bestQuizAttemptByQuizId.get(quiz.id)! 
        : null;

    const dbDuration = (m as { estimated_duration_minutes?: number | null }).estimated_duration_minutes;
    const estimatedDurationMinutes =
      typeof dbDuration === "number" && dbDuration >= 0
        ? dbDuration
        : contentCount * 5 + (quizCount ? 10 : 0);

    const expirationMonths = (m as { expiration_months?: number | null }).expiration_months;
    const expiration = computeExpiration(progressCompletedAt, expirationMonths);

    return {
      id: m.id,
      title: m.title,
      description: m.description ?? null,
      estimatedDurationMinutes,
      status,
      progressPercent,
      contentCount,
      quizCount,
      progressCompletedAt,
      expiration,
      quizResult,
    };
  });
}

/** Best attempt (by score) per quiz for the user. Only includes quizzes that have been attempted. */
async function getBestQuizAttemptByQuizId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  moduleIds: string[]
): Promise<Map<string, ModuleQuizResult>> {
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id")
    .in("module_id", moduleIds);
  const quizIds = (quizzes ?? []).map((q) => q.id);
  if (quizIds.length === 0) return new Map();

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score_percent, passed")
    .eq("user_id", userId)
    .in("quiz_id", quizIds);

  const byQuiz = new Map<string, ModuleQuizResult>();
  for (const a of attempts ?? []) {
    const existing = byQuiz.get(a.quiz_id);
    const score = a.score_percent ?? 0;
    const passed = !!a.passed;
    if (!existing) {
      byQuiz.set(a.quiz_id, { bestScorePercent: score, passed });
    } else {
      const bestScore = Math.max(existing.bestScorePercent, score);
      const everPassed = existing.passed || passed;
      byQuiz.set(a.quiz_id, { bestScorePercent: bestScore, passed: everPassed });
    }
  }
  return byQuiz;
}

async function getModuleProgressMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  moduleIds: string[]
): Promise<Map<string, string>> {
  const { data } = await supabase
    .from("user_module_progress")
    .select("module_id, completed_at")
    .eq("user_id", userId)
    .in("module_id", moduleIds);
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.completed_at) map.set(row.module_id, row.completed_at);
  }
  return map;
}

async function getLessonIdsByModule(
  supabase: Awaited<ReturnType<typeof createClient>>,
  moduleIds: string[]
): Promise<Map<string, string[]>> {
  const { data } = await supabase
    .from("training_lessons")
    .select("id, module_id")
    .in("module_id", moduleIds);
  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    const list = map.get(row.module_id) ?? [];
    list.push(row.id);
    map.set(row.module_id, list);
  }
  return map;
}

async function getCompletedLessonIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  moduleIds: string[]
): Promise<Set<string>> {
  const { data: lessons } = await supabase
    .from("training_lessons")
    .select("id")
    .in("module_id", moduleIds);
  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return new Set();

  const { data } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .in("lesson_id", lessonIds);
  return new Set((data ?? []).map((r) => r.lesson_id));
}

async function getQuizzesByModule(
  supabase: Awaited<ReturnType<typeof createClient>>,
  moduleIds: string[]
): Promise<Map<string, { id: string }>> {
  const { data } = await supabase
    .from("quizzes")
    .select("id, module_id")
    .in("module_id", moduleIds);
  const map = new Map<string, { id: string }>();
  for (const row of data ?? []) {
    map.set(row.module_id, { id: row.id });
  }
  return map;
}

async function getPassedQuizIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  moduleIds: string[]
): Promise<Set<string>> {
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id")
    .in("module_id", moduleIds);
  const quizIds = (quizzes ?? []).map((q) => q.id);
  if (quizIds.length === 0) return new Set();

  const { data } = await supabase
    .from("quiz_attempts")
    .select("quiz_id")
    .eq("user_id", userId)
    .eq("passed", true)
    .in("quiz_id", quizIds);
  return new Set((data ?? []).map((r) => r.quiz_id));
}
