import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/auth/get-session";
import { StaffCertificatesTable } from "@/components/certificates/StaffCertificatesTable";
import { getCertificatesForUser } from "@/services/certificate-service";

export default async function MyCertificatesPage() {
  const user = await requireUserOrRedirect();
  const rows = await getCertificatesForUser(user.id);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">
          Dashboard
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-medium text-slate-900">Certificates</span>
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-slate-900">My certificates</h1>
        <p className="mt-1 text-sm text-slate-600">
          Download PDF certificates for modules you have completed. Each module has one certificate; you can
          re-download anytime from this list.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          <p>No certificates yet. Complete a training module to receive one.</p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block text-sm font-medium text-primary-700 hover:text-primary-900"
          >
            Back to training
          </Link>
        </div>
      ) : (
        <StaffCertificatesTable rows={rows} />
      )}
    </div>
  );
}
