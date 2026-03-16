/**
 * Ensure a user exists as admin with the given password.
 * Creates the user if they don't exist; otherwise updates role to admin and sets password.
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local.
 * Run: npx tsx scripts/ensure-admin.ts [email] [password]
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const email = process.argv[2] ?? "tommy@harmonyheartshomecare.net";
const password = process.argv[3] ?? "harmony123!@#";

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

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    await supabase.from("profiles").update({ role_id: adminRole.id }).eq("id", existingProfile.id);
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(existingProfile.id, {
      password,
    });
    if (updateAuthError) {
      console.error("Profile set to admin, but password update failed:", updateAuthError.message);
      process.exit(1);
    }
    console.log(`${email} is now an administrator; password has been set. Sign in with the new password.`);
    return;
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: email.split("@")[0], role: "admin" },
  });

  if (createError) {
    console.error("Create failed:", createError.message);
    process.exit(1);
  }

  if (created.user) {
    const { error: roleError } = await supabase
      .from("profiles")
      .update({ role_id: adminRole.id })
      .eq("id", created.user.id);
    if (roleError) {
      console.warn("User created but role update failed:", roleError.message);
    }
  }

  console.log(`${email} has been created as an administrator. Sign in with the password you set.`);
}

main();
