import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export interface RoleRow {
  id: string;
  name: string;
}

export async function getRoles(): Promise<RoleRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("roles").select("id, name").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as RoleRow[];
}

export interface ProfileWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  role_id: string;
}

/**
 * Fetches all profiles with role name. Only call from admin context (RLS allows admins to read all profiles).
 */
export async function getAllProfilesWithRoles(): Promise<ProfileWithRole[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role_id, roles(name)");

  if (error) throw new Error(error.message);

  const list: ProfileWithRole[] = [];
  for (const row of rows ?? []) {
    const r = row as {
      id: string;
      email: string;
      full_name: string | null;
      role_id: string;
      roles: { name: string } | { name: string }[] | null;
    };
    const roleName = Array.isArray(r.roles) ? r.roles[0]?.name : r.roles?.name;
    list.push({
      id: r.id,
      email: r.email,
      full_name: r.full_name,
      role_id: r.role_id,
      role: roleName === "admin" ? "admin" : "staff",
    });
  }
  return list;
}
