import type { SupabaseClient } from "@supabase/supabase-js";
import { TRAINING_CONTENT_BUCKET, type LessonMediaType } from "./constants";
import { validateLessonFile } from "./validate-upload";

export type UploadLessonFileResult =
  | {
      success: true;
      /** Path to use in training_lessons.storage_path (e.g. "moduleId/uuid.pdf"). */
      storagePath: string;
    }
  | { success: false; error: string };

/**
 * Validates the file, uploads it to Supabase Storage, and returns the
 * storage path to store in the lesson record. Production-ready: type and
 * size validation, no overwrite (upsert: false), organized path.
 */
export async function uploadLessonFile(
  supabase: SupabaseClient,
  moduleId: string,
  file: File,
  contentType: LessonMediaType
): Promise<UploadLessonFileResult> {
  const validation = validateLessonFile(file, contentType);
  if (!validation.success) {
    return validation;
  }

  const ext = validation.ext;
  const path = `${moduleId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(TRAINING_CONTENT_BUCKET)
    .upload(path, file, {
      upsert: false,
      contentType: file.type || getDefaultContentType(ext),
    });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true, storagePath: path };
}

/** Safe to use on client; used for storage upload content-type. */
export function getDefaultContentType(ext: string): string {
  const map: Record<string, string> = {
    csv: "text/csv",
    pdf: "application/pdf",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    m4v: "video/x-m4v",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return map[ext] ?? "application/octet-stream";
}
