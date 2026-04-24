import type { Certificate } from "./database";

/** Certificate row with joins used in staff and admin lists (serializable for client props). */
export type CertificateListRow = Certificate & {
  training_modules?: { title: string } | null;
  profiles?: { full_name: string | null; email: string } | null;
};

/** Admin certificate list row (joined module + employee profile). */
export type AdminCertificateRow = Certificate & {
  training_modules: { title: string } | null;
  profiles: { full_name: string | null; email: string } | null;
};
