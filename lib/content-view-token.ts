import { createHmac, timingSafeEqual } from "crypto";

const ALG = "sha256";
const TTL_SEC = 3600; // 1 hour

function getSecret(): string {
  // In production, set CONTENT_VIEW_SECRET to a random string (e.g. 32 chars) for secure tokens.
  const s = process.env.CONTENT_VIEW_SECRET;
  if (s && s.length >= 16) return s;
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "content-view-fallback";
}

/**
 * Creates a short-lived token that allows viewing a piece of content.
 * Used to give the Office Online viewer a URL our API can validate and redirect to the signed storage URL.
 */
export function createContentViewToken(contentId: string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SEC;
  const payload = JSON.stringify({ contentId, exp });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const sig = createHmac(ALG, getSecret())
    .update(payload)
    .digest("base64url");
  return `${payloadB64}.${sig}`;
}

/**
 * Verifies the token and returns the contentId if valid.
 */
export function verifyContentViewToken(token: string): string | null {
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expectedSig = createHmac(ALG, getSecret()).update(payload).digest("base64url");
  if (expectedSig.length !== sig.length || !timingSafeEqual(Buffer.from(expectedSig, "utf8"), Buffer.from(sig, "utf8"))) {
    return null;
  }
  let data: { contentId: string; exp: number };
  try {
    data = JSON.parse(payload) as { contentId: string; exp: number };
  } catch {
    return null;
  }
  if (typeof data.contentId !== "string" || typeof data.exp !== "number") return null;
  if (data.exp < Math.floor(Date.now() / 1000)) return null;
  return data.contentId;
}
