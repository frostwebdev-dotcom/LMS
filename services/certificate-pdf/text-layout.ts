import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { certificateColors } from "./branding";

type Rgb = (typeof certificateColors)[keyof typeof certificateColors];

function toRgb(c: Rgb) {
  return rgb(c.r, c.g, c.b);
}

/** Word-wrap for deterministic PDF line breaks (no hyphenation). */
export function wrapTextToLines(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [""];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        let chunk = "";
        for (const ch of word) {
          const t = chunk + ch;
          if (font.widthOfTextAtSize(t, fontSize) <= maxWidth) chunk = t;
          else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function drawHorizontalRule(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  thickness: number,
  color: Rgb
): void {
  page.drawRectangle({
    x,
    y: y - thickness / 2,
    width,
    height: thickness,
    color: toRgb(color),
  });
}
