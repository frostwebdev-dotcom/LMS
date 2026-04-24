/**
 * Deployment-level certificate branding (not end-user PII).
 * Override via environment variables in production without code changes.
 */
export interface CertificateBranding {
  organizationName: string;
  organizationTagline: string;
  signatoryName: string;
  signatoryTitle: string;
}

const TRIM = (v: string | undefined) => (typeof v === "string" ? v.trim() : "");

/** RGB tuples 0–1 for pdf-lib */
export const certificateColors = {
  frameOuter: { r: 0.45, g: 0.62, b: 0.6 },
  frameInner: { r: 0.12, g: 0.45, b: 0.42 },
  heading: { r: 0.06, g: 0.22, b: 0.2 },
  accent: { r: 0.04, g: 0.42, b: 0.39 },
  body: { r: 0.28, g: 0.32, b: 0.34 },
  muted: { r: 0.42, g: 0.46, b: 0.48 },
  moduleBoxFill: { r: 0.94, g: 0.98, b: 0.97 },
  moduleBoxBorder: { r: 0.72, g: 0.86, b: 0.84 },
  rule: { r: 0.75, g: 0.82, b: 0.81 },
} as const;

export function resolveCertificateBranding(): CertificateBranding {
  return {
    organizationName: TRIM(process.env.CERTIFICATE_ORG_DISPLAY_NAME) || "Harmony Hearts Homecare",
    organizationTagline:
      TRIM(process.env.CERTIFICATE_ORG_TAGLINE) || "Compassionate care. Professional standards.",
    signatoryName: TRIM(process.env.CERTIFICATE_SIGNATORY_NAME) || "Director of Training & Compliance",
    signatoryTitle: TRIM(process.env.CERTIFICATE_SIGNATORY_TITLE) || "Harmony Hearts Homecare",
  };
}
