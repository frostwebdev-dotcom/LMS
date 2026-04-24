import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import { AdminCertificatesFilters } from "@/components/admin/AdminCertificatesFilters";
import { AdminCertificatesTable } from "@/components/admin/AdminCertificatesTable";
import {
  getAdminCertificateListRows,
  getTrainingModulesForAdminCertificateFilter,
} from "@/services/admin-certificate-service";
import { getAllProfilesWithRoles } from "@/services/admin-users-service";

export default async function AdminCertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ staff?: string; module?: string; q?: string }>;
}) {
  await requireAdminOrRedirect();
  const sp = await searchParams;
  const staffId = typeof sp.staff === "string" ? sp.staff : "";
  const moduleId = typeof sp.module === "string" ? sp.module : "";
  const q = typeof sp.q === "string" ? sp.q : "";

  const [rows, modules, profiles] = await Promise.all([
    getAdminCertificateListRows({
      staffUserId: staffId || null,
      moduleId: moduleId || null,
      q: q || null,
    }),
    getTrainingModulesForAdminCertificateFilter(),
    getAllProfilesWithRoles(),
  ]);

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-2 text-sm text-primary-800">
        <Link href="/admin" className="hover:text-primary-950">
          Admin
        </Link>
        <span className="text-primary-400">/</span>
        <span className="font-medium text-primary-950">Certificates</span>
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Staff certificates</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600 sm:text-base">
          View and download completion certificates for any staff member. Downloads use the same secure link as the
          staff portal and respect access control.
        </p>
      </header>

      <AdminCertificatesFilters
        modules={modules}
        staffProfiles={profiles}
        currentStaffId={staffId}
        currentModuleId={moduleId}
        currentQ={q}
      />

      <section aria-labelledby="cert-list-heading">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="cert-list-heading" className="text-lg font-semibold text-slate-900">
            Results
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">{rows.length} certificate{rows.length === 1 ? "" : "s"}</p>
        </div>
        <AdminCertificatesTable rows={rows} />
      </section>
    </div>
  );
}
