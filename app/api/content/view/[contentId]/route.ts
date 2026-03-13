import { NextRequest, NextResponse } from "next/server";
import { verifyContentViewToken } from "@/lib/content-view-token";
import { getContentById, getSignedUrl } from "@/services/content-service";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  pdf: "application/pdf",
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
    content.content_type === "presentation";
  const storagePath = content.storage_path && String(content.storage_path).trim();
  if (!isMedia || !storagePath) {
    return NextResponse.json({ error: "Not a viewable file" }, { status: 400 });
  }

  try {
    const signedUrl = await getSignedUrl(storagePath);
    const res = await fetch(signedUrl, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch file from storage" }, { status: 502 });
    }
    const ext = (storagePath.split(".").pop() ?? "").toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? res.headers.get("content-type") ?? "application/octet-stream";
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", "inline");
    return new NextResponse(res.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Failed to get file" }, { status: 502 });
  }
}
