import { getSessionUser, isAdmin } from "@/lib/auth/get-session";
import { createClient } from "@/lib/supabase/server";
import type { AdminCertificateRow } from "@/types/certificates";

export type { AdminCertificateRow } from "@/types/certificates";

export interface AdminCertificateListFilters {
  /** Filter by staff profile id */
  staffUserId?: string | null;
  /** Filter by training module id */
  moduleId?: string | null;
  /** Search certificate number, employee name/email, or module title (sanitized server-side) */
  q?: string | null;
}

function sanitizeSearchTerm(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.trim().slice(0, 80).replace(/%/g, "").replace(/_/g, "");
}

async function assertAdminSession(): Promise<void> {
  const user = await getSessionUser();
  if (!user || !isAdmin(user)) {
    throw new Error("Forbidden: admin only");
  }
}

/**
 * Lists certificates for the admin console with optional filters.
 * Uses the authenticated admin session (RLS: admins may read all certificate rows).
 */
export async function getAdminCertificateListRows(
  filters: AdminCertificateListFilters
): Promise<AdminCertificateRow[]> {
  await assertAdminSession();
  const supabase = await createClient();

  const staffUserId = filters.staffUserId?.trim() || null;
  const moduleId = filters.moduleId?.trim() || null;
  const term = sanitizeSearchTerm(filters.q);

  const select = "*, training_modules(title), profiles(full_name, email)";

  if (!term) {
    let q = supabase.from("certificates").select(select).order("issued_at", { ascending: false });
    if (staffUserId) q = q.eq("user_id", staffUserId);
    if (moduleId) q = q.eq("module_id", moduleId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return normalizeAdminRows(data ?? []);
  }

  const pattern = `%${term}%`;
  const [byCertNum, byName, byEmail, byModTitle] = await Promise.all([
    supabase.from("certificates").select("id").ilike("certificate_number", pattern),
    supabase.from("profiles").select("id").ilike("full_name", pattern),
    supabase.from("profiles").select("id").ilike("email", pattern),
    supabase.from("training_modules").select("id").ilike("title", pattern),
  ]);

  const profileIds = new Set<string>();
  for (const row of byName.data ?? []) profileIds.add((row as { id: string }).id);
  for (const row of byEmail.data ?? []) profileIds.add((row as { id: string }).id);
  const moduleIds = new Set((byModTitle.data ?? []).map((r) => (r as { id: string }).id));

  const idSet = new Set<string>();
  for (const row of byCertNum.data ?? []) idSet.add((row as { id: string }).id);

  const profileIdList = [...profileIds];
  if (profileIdList.length > 0) {
    const { data: byUser } = await supabase.from("certificates").select("id").in("user_id", profileIdList);
    for (const row of byUser ?? []) idSet.add((row as { id: string }).id);
  }

  const moduleIdList = [...moduleIds];
  if (moduleIdList.length > 0) {
    const { data: byMod } = await supabase.from("certificates").select("id").in("module_id", moduleIdList);
    for (const row of byMod ?? []) idSet.add((row as { id: string }).id);
  }

  const ids = [...idSet];
  if (ids.length === 0) return [];

  const CHUNK = 100;
  const rows: unknown[] = [];
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    let q = supabase.from("certificates").select(select).in("id", chunk).order("issued_at", { ascending: false });
    if (staffUserId) q = q.eq("user_id", staffUserId);
    if (moduleId) q = q.eq("module_id", moduleId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
  }
  rows.sort((a, b) => {
    const da = new Date((a as { issued_at: string }).issued_at).getTime();
    const db = new Date((b as { issued_at: string }).issued_at).getTime();
    return db - da;
  });
  return normalizeAdminRows(rows);
}

function normalizeAdminRows(rows: unknown[]): AdminCertificateRow[] {
  return rows.map((row) => {
    const r = row as AdminCertificateRow & {
      training_modules?: { title: string } | { title: string }[] | null;
      profiles?: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
    };
    const tm = r.training_modules;
    const training_modules = Array.isArray(tm) ? tm[0] ?? null : tm ?? null;
    const pr = r.profiles;
    const profiles = Array.isArray(pr) ? pr[0] ?? null : pr ?? null;
    return { ...r, training_modules, profiles };
  });
}

/** Training modules for admin certificate filters (RLS: admin read). */
export async function getTrainingModulesForAdminCertificateFilter(): Promise<{ id: string; title: string }[]> {
  await assertAdminSession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_modules")
    .select("id, title")
    .order("title", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; title: string }[];
}
