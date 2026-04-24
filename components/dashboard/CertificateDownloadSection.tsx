import type { Certificate } from "@/types/database";

interface CertificateDownloadSectionProps {
  certificate: Certificate | null;
  moduleTitle: string;
}

export function CertificateDownloadSection({ certificate, moduleTitle }: CertificateDownloadSectionProps) {
  if (!certificate) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <p className="font-medium text-slate-800">Certificate</p>
        <p className="mt-1">
          Your completion certificate for <span className="font-medium text-slate-800">{moduleTitle}</span> will appear
          here after you finish this module. If it does not show within a minute, refresh the page.
        </p>
      </div>
    );
  }

  const href = `/api/certificates/${certificate.id}/download`;
  const statusNote =
    certificate.status === "pdf_failed"
      ? "We could not generate the PDF last time. Try again — we will retry automatically."
      : certificate.status === "pending_pdf"
        ? "Your PDF is being prepared. You can download as soon as it is ready."
        : null;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-4">
      <p className="text-sm font-semibold text-emerald-900">Certificate of completion</p>
      <p className="mt-1 text-xs text-emerald-800/90">
        {moduleTitle} · #{certificate.certificate_number}
      </p>
      {statusNote && <p className="mt-2 text-sm text-emerald-900/90">{statusNote}</p>}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Download certificate (PDF)
      </a>
      <p className="mt-2 text-xs text-emerald-800/80">Opens in a new tab. The download link expires in a few minutes.</p>
    </div>
  );
}
