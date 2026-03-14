/**
 * Seed script for local/development testing.
 * Creates: 1 admin, 2 staff users, 2 modules with lessons, 1 quiz with MC questions, sample progress.
 *
 * Loads .env.local (then .env). Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.
 * Run: npm run seed
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

function loadEnvFile(path: string) {
  const full = resolve(projectRoot, path);
  if (!existsSync(full)) return;
  const content = readFileSync(full, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1);
    if (key && !process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_ID = "11111111-1111-1111-1111-111111111111";
const STAFF1_ID = "22222222-2222-2222-2222-222222222222";
const STAFF2_ID = "33333333-3333-3333-3333-333333333333";
const DEFAULT_PASSWORD = "SeedPassword1!";

const MODULE1_ID = "a0000001-0000-4000-8000-000000000001";
const MODULE2_ID = "a0000002-0000-4000-8000-000000000002";

async function main() {
  console.log("Seeding...");

  const { data: roles } = await supabase.from("roles").select("id, name");
  const adminRoleId = roles?.find((r) => r.name === "admin")?.id;
  const staffRoleId = roles?.find((r) => r.name === "staff")?.id;
  if (!adminRoleId || !staffRoleId) {
    throw new Error("roles table missing admin/staff. Run migrations first.");
  }

  const authAdmin = supabase.auth.admin;

  for (const u of [
    { id: ADMIN_ID, email: "admin@example.com", name: "Admin User", role: "admin" },
    { id: STAFF1_ID, email: "staff1@example.com", name: "Jordan Smith", role: "staff" },
    { id: STAFF2_ID, email: "staff2@example.com", name: "Casey Jones", role: "staff" },
  ]) {
    const { error } = await authAdmin.createUser({
      id: u.id,
      email: u.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.name, role: u.role },
    });
    if (error && error.message?.includes("already been registered")) {
      console.log(u.email + " already exists, skipping");
    } else if (error) {
      throw error;
    } else {
      console.log("Created " + u.email);
    }
  }

  await supabase
    .from("profiles")
    .update({ role_id: adminRoleId })
    .eq("id", ADMIN_ID);
  console.log("Set admin profile role");

  await supabase.from("user_module_progress").delete().in("module_id", [MODULE1_ID, MODULE2_ID]);
  const { data: seedLessons } = await supabase.from("training_lessons").select("id").in("module_id", [MODULE1_ID, MODULE2_ID]);
  if (seedLessons?.length) {
    await supabase.from("user_lesson_progress").delete().in("lesson_id", seedLessons.map((l) => l.id));
  }
  const { data: seedQuizzes } = await supabase.from("quizzes").select("id").in("module_id", [MODULE1_ID, MODULE2_ID]);
  if (seedQuizzes?.length) {
    const qids = seedQuizzes.map((q) => q.id);
    const { data: attempts } = await supabase.from("quiz_attempts").select("id").in("quiz_id", qids);
    if (attempts?.length) {
      await supabase.from("quiz_attempt_answers").delete().in("attempt_id", attempts.map((a) => a.id));
    }
    await supabase.from("quiz_attempts").delete().in("quiz_id", qids);
    const { data: qq } = await supabase.from("quiz_questions").select("id").in("quiz_id", qids);
    if (qq?.length) {
      await supabase.from("quiz_answers").delete().in("question_id", qq.map((r) => r.id));
    }
    await supabase.from("quiz_questions").delete().in("quiz_id", qids);
    await supabase.from("quizzes").delete().in("module_id", [MODULE1_ID, MODULE2_ID]);
  }
  await supabase.from("training_lessons").delete().in("module_id", [MODULE1_ID, MODULE2_ID]);
  console.log("Cleaned previous seed data");

  const { error: m1 } = await supabase.from("training_modules").upsert(
    [
      {
        id: MODULE1_ID,
        title: "Safety Basics",
        description: "Core safety and compliance training.",
        sort_order: 0,
        is_published: true,
        estimated_duration_minutes: 15,
      },
      {
        id: MODULE2_ID,
        title: "Care Standards",
        description: "Quality care and documentation.",
        sort_order: 1,
        is_published: true,
        estimated_duration_minutes: 20,
      },
    ],
    { onConflict: "id" }
  );
  if (m1) throw m1;
  console.log("Inserted 2 modules");

  const { data: lessons } = await supabase
    .from("training_lessons")
    .insert([
      { module_id: MODULE1_ID, title: "Introduction to Safety", lesson_type: "text", content_text: "Welcome. This lesson covers basic safety principles.", sort_order: 0 },
      { module_id: MODULE1_ID, title: "Emergency Procedures", lesson_type: "text", content_text: "What to do in an emergency.", sort_order: 1 },
      { module_id: MODULE2_ID, title: "Care Guidelines", lesson_type: "text", content_text: "Guidelines for quality care.", sort_order: 0 },
      { module_id: MODULE2_ID, title: "Documentation", lesson_type: "text", content_text: "How to document care properly.", sort_order: 1 },
    ])
    .select("id, module_id, title");
  if (!lessons?.length) throw new Error("Failed to insert lessons");
  console.log("Inserted 4 lessons");

  const [lesson1, lesson2, lesson3, lesson4] = lessons;

  const { data: quiz } = await supabase
    .from("quizzes")
    .insert({
      module_id: MODULE1_ID,
      title: "Safety Basics Quiz",
      description: "Check your understanding.",
      passing_score_percent: 80,
    })
    .select("id")
    .single();
  if (!quiz) throw new Error("Failed to insert quiz");
  const QUIZ_ID = quiz.id;
  console.log("Inserted quiz");

  const { data: questions } = await supabase
    .from("quiz_questions")
    .insert([
      { quiz_id: QUIZ_ID, question_text: "What is the first step in an emergency?", sort_order: 0 },
      { quiz_id: QUIZ_ID, question_text: "Who should you report safety concerns to?", sort_order: 1 },
    ])
    .select("id");
  if (!questions?.length) throw new Error("Failed to insert questions");
  const [q1, q2] = questions;

  const { data: answers } = await supabase
    .from("quiz_answers")
    .insert([
      { question_id: q1.id, answer_text: "Call for help", is_correct: true, sort_order: 0 },
      { question_id: q1.id, answer_text: "Leave the building", is_correct: false, sort_order: 1 },
      { question_id: q2.id, answer_text: "Your supervisor", is_correct: true, sort_order: 0 },
      { question_id: q2.id, answer_text: "No one", is_correct: false, sort_order: 1 },
    ])
    .select("id, question_id, is_correct");
  if (!answers?.length) throw new Error("Failed to insert answers");
  const correct1 = answers.find((a) => a.question_id === q1.id && a.is_correct)!;
  const correct2 = answers.find((a) => a.question_id === q2.id && a.is_correct)!;
  console.log("Inserted quiz questions and answers");

  const now = new Date().toISOString();

  await supabase.from("user_lesson_progress").upsert(
    [
      { user_id: STAFF1_ID, lesson_id: lesson1.id, completed_at: now },
      { user_id: STAFF1_ID, lesson_id: lesson2.id, completed_at: now },
      { user_id: STAFF2_ID, lesson_id: lesson1.id, completed_at: now },
    ],
    { onConflict: "user_id,lesson_id" }
  );
  console.log("Inserted lesson progress");

  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: STAFF1_ID,
      quiz_id: QUIZ_ID,
      score_percent: 100,
      passed: true,
    })
    .select("id")
    .single();
  if (!attempt) throw new Error("Failed to insert quiz attempt");
  await supabase.from("quiz_attempt_answers").insert([
    { attempt_id: attempt.id, question_id: q1.id, answer_id: correct1.id },
    { attempt_id: attempt.id, question_id: q2.id, answer_id: correct2.id },
  ]);
  console.log("Inserted quiz attempt for staff1 (passed)");

  await supabase.from("user_module_progress").upsert(
    { user_id: STAFF1_ID, module_id: MODULE1_ID, completed_at: now },
    { onConflict: "user_id,module_id" }
  );
  console.log("Inserted module completion for staff1 (Safety Basics)");

  console.log("\nDone. Log in with:");
  console.log("  Admin:  admin@example.com / " + DEFAULT_PASSWORD);
  console.log("  Staff1: staff1@example.com / " + DEFAULT_PASSWORD);
  console.log("  Staff2: staff2@example.com / " + DEFAULT_PASSWORD);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
