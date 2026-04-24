import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createClientServiceRole } from "@/lib/supabase/service-role-server";
import { buildCertificatePdfBuffer } from "@/services/certificate-pdf";
import type { CertificateListRow } from "@/types/certificates";
import type { Certificate, CertificateStatus } from "@/types/database";

const CERT_BUCKET = "learning-certificates";

export function generateCertificateNumber(): string {
  const year = new Date().getUTCFullYear();
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `HHC-${year}-${suffix}`;
}

function formatCertificateDateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function optionalCertificateLocation(): string | undefined {
  const v = process.env.CERTIFICATE_DISPLAY_LOCATION?.trim();
  return v || undefined;
}

/** Signed URL lifetime for PDF download (seconds). */
const CERTIFICATE_DOWNLOAD_URL_TTL_SECONDS = 300;

/**
 * After a unique conflict on (user_id, module_id), load the existing row and retry PDF finalization
 * if the file is not yet stored (heals races and prior finalize failures).
 */
async function tryFinalizeExistingCertificateForUserModule(
  supabase: SupabaseClient,
  userId: string,
  moduleId: string
): Promise<void> {
  const { data: existing, error } = await supabase
    .from("certificates")
    .select("id, status, pdf_storage_path")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (error) {
    console.error("[certificates] load existing after conflict:", error.message);
    return;
  }
  const row = existing as { id: string; status: CertificateStatus; pdf_storage_path: string | null } | null;
  if (!row) return;
  if (row.status === "issued" && row.pdf_storage_path) return;

  try {
    await finalizeCertificatePdf(row.id);
  } catch (e) {
    console.error("[certificates] finalize existing row:", e);
  }
}

/**
 * After user_module_progress is written for a completion, creates the certificate row
 * (idempotent via UNIQUE user_id + module_id) and attempts PDF upload + status update.
 * Safe to call on every completion path; failures are logged and do not throw by default.
 */
export async function issueCertificateAfterModuleCompletion(
  supabase: SupabaseClient,
  userId: string,
  moduleId: string,
  options?: { throwOnInsert?: boolean }
): Promise<void> {
  try {
    await issueCertificateAfterModuleCompletionInner(supabase, userId, moduleId, options);
  } catch (e) {
    if (options?.throwOnInsert) throw e;
    console.error("[certificates] issue (unexpected):", e);
  }
}

async function issueCertificateAfterModuleCompletionInner(
  supabase: SupabaseClient,
  userId: string,
  moduleId: string,
  options?: { throwOnInsert?: boolean }
): Promise<void> {
  const { data: progress, error: progErr } = await supabase
    .from("user_module_progress")
    .select("id, user_id, module_id, completed_at")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (progErr) {
    console.error("[certificates] load progress:", progErr.message);
    return;
  }
  const row = progress as {
    id: string;
    user_id: string;
    module_id: string;
    completed_at: string | null;
  } | null;
  if (!row?.completed_at) return;
  if (row.user_id !== userId) return;

  const certificate_number = generateCertificateNumber();
  const completion_date = row.completed_at;

  const { data: inserted, error: insErr } = await supabase
    .from("certificates")
    .insert({
      user_id: userId,
      module_id: moduleId,
      module_progress_id: row.id,
      certificate_number,
      completion_date,
      pdf_access_strategy: "signed_url_private_bucket",
      status: "pending_pdf",
    })
    .select("id")
    .maybeSingle();

  if (insErr) {
    if (insErr.code === "23505") {
      await tryFinalizeExistingCertificateForUserModule(supabase, userId, moduleId);
      return;
    }
    console.error("[certificates] insert:", insErr.message);
    if (options?.throwOnInsert) throw new Error(insErr.message);
    return;
  }

  const certId = (inserted as { id: string } | null)?.id;
  if (!certId) return;

  try {
    await finalizeCertificatePdf(certId);
  } catch (e) {
    console.error("[certificates] finalize:", e);
  }
}


/**
 * Generates PDF, uploads to private bucket, marks issued. Uses service role for storage + update.
 */
export async function finalizeCertificatePdf(certificateId: string): Promise<void> {
  let admin: ReturnType<typeof createClientServiceRole>;
  try {
    admin = createClientServiceRole();
  } catch {
    return;
  }

  const { data: cert, error: loadErr } = await admin.from("certificates").select("*").eq("id", certificateId).maybeSingle();

  if (loadErr || !cert) {
    if (loadErr) console.error("[certificates] finalize load:", loadErr.message);
    return;
  }

  const c = cert as Certificate;

  if (c.status === "issued" && c.pdf_storage_path) return;

  const [{ data: moduleRow }, { data: profileRow }] = await Promise.all([
    admin.from("training_modules").select("title").eq("id", c.module_id).maybeSingle(),
    admin.from("profiles").select("full_name, email").eq("id", c.user_id).maybeSingle(),
  ]);

  const moduleTitle = (moduleRow as { title: string } | null)?.title ?? "Training module";
  const prof = profileRow as { full_name: string | null; email: string } | null;
  const recipient = prof?.full_name?.trim() || prof?.email || "Participant";

  const pdfBytes = await buildCertificatePdfBuffer({
    recipientDisplayName: recipient,
    moduleTitle,
    certificateNumber: c.certificate_number,
    completionDateLabel: formatCertificateDateLabel(c.completion_date),
    issueDateLabel: formatCertificateDateLabel(c.issued_at),
    locationName: optionalCertificateLocation(),
  });

  const path = `${c.user_id}/${c.id}.pdf`;
  const { error: upErr } = await admin.storage.from(CERT_BUCKET).upload(path, pdfBytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (upErr) {
    await admin.from("certificates").update({ status: "pdf_failed" as CertificateStatus }).eq("id", certificateId);
    throw new Error(upErr.message);
  }

  const { error: updErr } = await admin
    .from("certificates")
    .update({
      pdf_storage_path: path,
      status: "issued" as CertificateStatus,
    })
    .eq("id", certificateId);

  if (updErr) throw new Error(updErr.message);
}

export type { CertificateListRow } from "@/types/certificates";

export async function getCertificateForUserAndModule(
  userId: string,
  moduleId: string
): Promise<Certificate | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Certificate | null) ?? null;
}

export async function getCertificatesForUser(userId: string): Promise<CertificateListRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("*, training_modules(title), profiles(full_name, email)")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const r = row as CertificateListRow & {
      training_modules?: { title: string } | { title: string }[] | null;
      profiles?: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
    };
    const tm = r.training_modules;
    const mod = Array.isArray(tm) ? tm[0] : tm;
    const pr = r.profiles;
    const prof = Array.isArray(pr) ? pr[0] : pr;
    return { ...r, training_modules: mod ?? null, profiles: prof ?? null };
  });
}

/**
 * Ensures PDF exists when possible, then returns a short-lived signed URL for download.
 */
export async function getCertificateDownloadSignedUrl(
  certificateId: string,
  requesterUserId: string,
  isAdmin: boolean
): Promise<{ url: string } | { error: string; status: number }> {
  const supabase = await createClient();
  const { data: cert, error } = await supabase
    .from("certificates")
    .select("id, user_id, pdf_storage_path, status")
    .eq("id", certificateId)
    .maybeSingle();

  if (error) {
    console.error("[certificates] download select:", error.message);
    return { error: "Certificate not found.", status: 404 };
  }
  if (!cert) {
    return { error: "Certificate not found.", status: 404 };
  }
  const c = cert as { id: string; user_id: string; pdf_storage_path: string | null; status: CertificateStatus };
  if (!isAdmin && c.user_id !== requesterUserId) {
    return { error: "Forbidden.", status: 403 };
  }

  if (c.status !== "issued" || !c.pdf_storage_path) {
    try {
      await finalizeCertificatePdf(certificateId);
    } catch (e) {
      console.error("[certificates] download finalize:", e);
      return { error: "Certificate file is not ready yet. Try again shortly.", status: 503 };
    }
  }

  let admin: ReturnType<typeof createClientServiceRole>;
  try {
    admin = createClientServiceRole();
  } catch {
    return { error: "Download is temporarily unavailable.", status: 503 };
  }

  const { data: row } = await admin.from("certificates").select("pdf_storage_path, status").eq("id", certificateId).single();
  const path = (row as { pdf_storage_path: string | null; status: CertificateStatus } | null)?.pdf_storage_path;
  const st = (row as { status: CertificateStatus } | null)?.status;
  if (!path || st !== "issued") {
    return { error: "Certificate file is not ready yet.", status: 503 };
  }

  const { data: signed, error: signErr } = await admin.storage
    .from(CERT_BUCKET)
    .createSignedUrl(path, CERTIFICATE_DOWNLOAD_URL_TTL_SECONDS);

  if (signErr || !signed?.signedUrl) {
    return { error: "Could not create download link.", status: 503 };
  }
  return { url: signed.signedUrl };
}
