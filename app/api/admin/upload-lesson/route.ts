import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/get-session";
import { createClient } from "@/lib/supabase/server";
import { createContentSchema } from "@/lib/validations/content";
import { toUserFriendlyError } from "@/lib/actions/errors";
import { uploadLessonFile } from "@/lib/storage/upload-lesson-file";

export const dynamic = "force-dynamic";

/** Max body size for this route (100 MB). Route Handlers are not subject to Server Action 1MB limit. */
export const maxDuration = 60;

export async function POST(request: Request) {
  const contentTypeHeader = request.headers.get("content-type") ?? "";
  if (!contentTypeHeader.includes("multipart/form-data")) {
    return NextResponse.json(
      {
        success: false,
        error: "Request must be multipart/form-data. Do not set Content-Type manually when sending FormData.",
      },
      { status: 400 }
    );
  }

  // Parse body first so it isn't consumed by other logic; auth check immediately after.
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Invalid request body.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  const file = formData.get("file") as File | null;
  const moduleId = formData.get("module_id") as string | null;
  const title = String(formData.get("title") ?? "").trim();
  const lessonType = formData.get("content_type") as "video" | "pdf" | "presentation" | null;
  const sortOrder = formData.get("sort_order") ? Number(formData.get("sort_order")) : 0;

  if (!file || !moduleId || !title || !lessonType) {
    return NextResponse.json(
      { success: false, error: "Title, type, module, and file are required." },
      { status: 400 }
    );
  }

  const parsed = createContentSchema.safeParse({
    module_id: moduleId,
    title,
    content_type: lessonType,
    sort_order: sortOrder,
  });
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Validation failed.",
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const uploadResult = await uploadLessonFile(
    supabase,
    moduleId,
    file,
    parsed.data.content_type
  );
  if (!uploadResult.success) {
    return NextResponse.json(
      { success: false, error: toUserFriendlyError(uploadResult.error) },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("training_lessons")
    .insert({
      module_id: moduleId,
      title: parsed.data.title,
      lesson_type: parsed.data.content_type,
      storage_path: uploadResult.storagePath,
      sort_order: parsed.data.sort_order ?? 0,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: toUserFriendlyError(error.message) },
      { status: 500 }
    );
  }

  revalidatePath(`/admin/modules/${moduleId}`);
  return NextResponse.json({ success: true, id: data?.id });
}
