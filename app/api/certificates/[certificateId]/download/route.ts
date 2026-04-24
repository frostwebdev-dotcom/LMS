import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth/get-session";
import { getCertificateDownloadSignedUrl } from "@/services/certificate-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ certificateId: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { certificateId } = await context.params;
  const result = await getCertificateDownloadSignedUrl(certificateId, user.id, isAdmin(user));

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.redirect(result.url);
}
