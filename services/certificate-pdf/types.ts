/**
 * Data-driven inputs for the completion certificate PDF.
 * Organization display strings come from {@link resolveCertificateBranding} (env + safe defaults).
 */
export interface CertificatePdfInput {
  recipientDisplayName: string;
  moduleTitle: string;
  certificateNumber: string;
  completionDateLabel: string;
  issueDateLabel: string;
  /** Branch or service area; omitted when empty. */
  locationName?: string | null;
}
