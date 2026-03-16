/**
 * Set a user as admin by email.
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local.
 * Run: npx tsx scripts/set-admin.ts [email]
 * Example: npx tsx scripts/set-admin.ts tommy@harmonyheartshomecare.net
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const email = process.argv[2] ?? "tommy@harmonyheartshomecare.net";

async function main() {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: adminRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "admin")
    .limit(1)
    .single();

  if (!adminRole?.id) {
    console.error("Could not find admin role. Run migrations first.");
    process.exit(1);
  }

  const { data: profile, error: updateError } = await supabase
    .from("profiles")
    .update({ role_id: adminRole.id })
    .eq("email", email)
    .select("id, email")
    .maybeSingle();

  if (updateError) {
    console.error("Update failed:", updateError.message);
    process.exit(1);
  }

  if (!profile) {
    console.error(`No profile found for ${email}. User must sign up first.`);
    process.exit(1);
  }

  console.log(`Done. ${profile.email} is now an administrator. Sign in again to see the Admin area.`);
}

main();
