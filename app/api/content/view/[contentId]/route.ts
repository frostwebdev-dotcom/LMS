import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/get-session";
import { verifyContentViewToken } from "@/lib/content-view-token";
import { getContentById, getSignedUrl } from "@/services/content-service";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  csv: "text/csv; charset=utf-8",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  m4v: "video/x-m4v",
};

/**
 * Streams a content file for the Office Online viewer.
 * Call with ?t=<token>. Verifies the token, fetches the file from storage, and streams it
 * so the viewer receives the actual file (redirects can fail when the viewer fetches the URL).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await context.params;
  const token = request.nextUrl.searchParams.get("t");
  if (!token || !contentId) {
    return NextResponse.json({ error: "Missing token or content ID" }, { status: 400 });
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verifiedId = verifyContentViewToken(token);
  if (verifiedId === null || verifiedId !== contentId) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  const content = await getContentById(verifiedId);
  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  const isMedia =
    content.content_type === "video" ||
    content.content_type === "pdf" ||
    content.content_type === "image" ||
    content.content_type === "csv";
  const storagePath = content.storage_path && String(content.storage_path).trim();
  if (!isMedia || !storagePath) {
    return NextResponse.json({ error: "Not a viewable file" }, { status: 400 });
  }

  try {
    const signedUrl = await getSignedUrl(storagePath);
    const range = request.headers.get("Range");
    const upstreamHeaders: HeadersInit = {};
    if (range) upstreamHeaders.Range = range;

    const res = await fetch(signedUrl, {
      cache: "no-store",
      headers: upstreamHeaders,
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch file from storage" }, { status: 502 });
    }
    const ext = (storagePath.split(".").pop() ?? "").toLowerCase();
    const contentType =
      CONTENT_TYPES[ext] ?? res.headers.get("content-type") ?? "application/octet-stream";
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    /** Inline display (avoids mobile browsers treating PDF/media as a download). */
    headers.set("Content-Disposition", "inline");
    headers.set("Cache-Control", "private, no-store, max-age=0");
    headers.set("X-Content-Type-Options", "nosniff");

    const passthrough = ["content-range", "accept-ranges", "content-length"] as const;
    for (const h of passthrough) {
      const v = res.headers.get(h);
      if (v) headers.set(h, v);
    }

    return new NextResponse(res.body, { status: res.status, headers });
  } catch {
    return NextResponse.json({ error: "Failed to get file" }, { status: 502 });
  }
}
