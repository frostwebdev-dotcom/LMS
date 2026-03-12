import type { Profile, UserRole } from "./database";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
}

export function sessionUserFromProfile(profile: Profile): SessionUser {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    fullName: profile.full_name,
  };
}
