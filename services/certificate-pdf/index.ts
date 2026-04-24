import { PDFDocument, StandardFonts } from "pdf-lib";
import { resolveCertificateBranding } from "./branding";
import { drawCertificatePage } from "./draw-certificate-page";
import type { CertificatePdfInput } from "./types";

export type { CertificatePdfInput } from "./types";
export { resolveCertificateBranding, certificateColors } from "./branding";

const LETTER_SIZE: [number, number] = [612, 792];

/**
 * Builds a one-page US Letter PDF using pdf-lib (vector text and shapes only).
 * No embedded images or web fonts — deterministic output suitable for printing.
 */
export async function buildCertificatePdfBuffer(input: CertificatePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage(LETTER_SIZE);
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const branding = resolveCertificateBranding();
  drawCertificatePage(page, fonts, input, branding);
  return doc.save();
}
