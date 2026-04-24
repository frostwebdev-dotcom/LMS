import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { CertificateBranding } from "./branding";
import { certificateColors } from "./branding";
import type { CertificatePdfInput } from "./types";
import { drawHorizontalRule, wrapTextToLines } from "./text-layout";

const LETTER_W = 612;
const LETTER_H = 792;

function col(c: { r: number; g: number; b: number }) {
  return rgb(c.r, c.g, c.b);
}

/** Fixed band from page bottom for signature + disclaimer (print-safe, avoids overlap). */
const BOTTOM_BAND = {
  /** Last line of disclaimer (smallest y). */
  disclaimerLastBaseline: 52,
  signatoryTitleY: 82,
  signatoryNameY: 100,
  signatureRuleY: 118,
  /** Do not place flowing body text below this baseline (from bottom). */
  bodyFloor: 175,
};

/**
 * Renders one US Letter portrait page. Uses only embedded StandardFonts and fixed geometry
 * so output is stable across Node/OS versions.
 */
export function drawCertificatePage(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  input: CertificatePdfInput,
  branding: CertificateBranding
): void {
  const { width, height } = page.getSize();
  void LETTER_W;
  void LETTER_H;

  const margin = 52;
  const outerInset = 28;
  const innerInset = 36;
  const textInset = 22;

  page.drawRectangle({
    x: outerInset,
    y: outerInset,
    width: width - outerInset * 2,
    height: height - outerInset * 2,
    borderColor: col(certificateColors.frameOuter),
    borderWidth: 2,
  });

  page.drawRectangle({
    x: innerInset,
    y: innerInset,
    width: width - innerInset * 2,
    height: height - innerInset * 2,
    borderColor: col(certificateColors.frameInner),
    borderWidth: 0.85,
  });

  const contentLeft = innerInset + textInset;
  const contentRight = width - innerInset - textInset;
  const contentWidth = contentRight - contentLeft;
  const bodyFloorY = BOTTOM_BAND.bodyFloor;

  let y = height - margin - textInset;

  page.drawText(branding.organizationName.toUpperCase(), {
    x: contentLeft,
    y,
    size: 10,
    font: fonts.bold,
    color: col(certificateColors.accent),
  });
  y -= 14;
  page.drawText(branding.organizationTagline, {
    x: contentLeft,
    y,
    size: 8.5,
    font: fonts.regular,
    color: col(certificateColors.muted),
  });
  y -= 28;

  drawHorizontalRule(page, contentLeft, y + 6, contentWidth, 1, certificateColors.rule);
  y -= 20;

  const title = "Certificate of Training Completion";
  const titleSize = 22;
  const tw = fonts.bold.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: (width - tw) / 2,
    y,
    size: titleSize,
    font: fonts.bold,
    color: col(certificateColors.heading),
  });
  y -= 28;

  drawHorizontalRule(page, contentLeft, y + 8, contentWidth, 0.75, certificateColors.rule);
  y -= 36;

  page.drawText("This certifies that", {
    x: contentLeft,
    y,
    size: 11,
    font: fonts.regular,
    color: col(certificateColors.body),
  });
  y -= 26;

  const nameSize = 24;
  const nameLines = wrapTextToLines(input.recipientDisplayName, fonts.bold, nameSize, contentWidth);
  for (const line of nameLines) {
    if (y < bodyFloorY + nameSize + 8) break;
    const nw = fonts.bold.widthOfTextAtSize(line, nameSize);
    page.drawText(line, {
      x: (width - nw) / 2,
      y,
      size: nameSize,
      font: fonts.bold,
      color: col(certificateColors.accent),
    });
    y -= nameSize + 6;
  }
  y -= 8;

  page.drawText("has successfully completed the training module", {
    x: contentLeft,
    y,
    size: 11,
    font: fonts.regular,
    color: col(certificateColors.body),
  });
  y -= 28;

  const boxPadX = 18;
  const boxPadY = 14;
  const moduleLines = wrapTextToLines(input.moduleTitle, fonts.bold, 13, contentWidth - boxPadX * 2);
  const moduleLineHeight = 16;
  const boxHeight = boxPadY * 2 + moduleLines.length * moduleLineHeight;
  const boxTop = y;
  const boxBottom = boxTop - boxHeight;

  if (boxBottom > bodyFloorY) {
    page.drawRectangle({
      x: contentLeft,
      y: boxBottom,
      width: contentWidth,
      height: boxHeight,
      color: col(certificateColors.moduleBoxFill),
      borderColor: col(certificateColors.moduleBoxBorder),
      borderWidth: 0.75,
    });

    let lineY = boxTop - boxPadY - 2;
    for (const line of moduleLines) {
      page.drawText(line, {
        x: contentLeft + boxPadX,
        y: lineY,
        size: 13,
        font: fonts.bold,
        color: col(certificateColors.heading),
      });
      lineY -= moduleLineHeight;
    }
  }
  y = Math.min(boxBottom, y) - boxPadY - 20;

  const metaSize = 10;
  const metaLineHeight = 12;
  const labelColW = 118;

  const drawMetaRow = (label: string, value: string) => {
    if (y < bodyFloorY + metaLineHeight * 2) return;
    page.drawText(`${label}:`, {
      x: contentLeft,
      y,
      size: metaSize,
      font: fonts.bold,
      color: col(certificateColors.muted),
    });
    const valueLines = wrapTextToLines(value, fonts.regular, metaSize, contentWidth - labelColW);
    let vy = y;
    for (let i = 0; i < valueLines.length; i++) {
      page.drawText(valueLines[i], {
        x: contentLeft + labelColW,
        y: vy,
        size: metaSize,
        font: fonts.regular,
        color: col(certificateColors.body),
      });
      vy -= metaLineHeight;
    }
    y = vy - 6;
  };

  drawMetaRow("Completion date", input.completionDateLabel);
  drawMetaRow("Issue date", input.issueDateLabel);
  drawMetaRow("Certificate no.", input.certificateNumber);
  if (input.locationName?.trim()) {
    drawMetaRow("Location / branch", input.locationName.trim());
  }

  const sigBlockWidth = Math.min(contentWidth * 0.48, 240);
  const sigX = contentRight - sigBlockWidth;

  drawHorizontalRule(page, sigX, BOTTOM_BAND.signatureRuleY, sigBlockWidth, 0.65, certificateColors.rule);
  page.drawText(branding.signatoryName, {
    x: sigX,
    y: BOTTOM_BAND.signatoryNameY,
    size: 10,
    font: fonts.bold,
    color: col(certificateColors.heading),
  });
  page.drawText(branding.signatoryTitle, {
    x: sigX,
    y: BOTTOM_BAND.signatoryTitleY,
    size: 8.5,
    font: fonts.regular,
    color: col(certificateColors.muted),
  });

  const foot = `This certificate was generated electronically by the ${branding.organizationName} training portal and is valid without a handwritten signature.`;
  const footSize = 7.5;
  const footLineHeight = 10;
  const footLines = wrapTextToLines(foot, fonts.regular, footSize, contentWidth);
  let footY = BOTTOM_BAND.disclaimerLastBaseline + (footLines.length - 1) * footLineHeight;
  for (const line of footLines) {
    const lw = fonts.regular.widthOfTextAtSize(line, footSize);
    page.drawText(line, {
      x: (width - lw) / 2,
      y: footY,
      size: footSize,
      font: fonts.regular,
      color: col(certificateColors.muted),
    });
    footY -= footLineHeight;
  }
}
