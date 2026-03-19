/**
 * Supabase Storage layout for training content.
 *
 * Bucket: training-content (private)
 * Path:   {moduleId}/{uuid}.{ext}
 *
 * - moduleId: UUID of the training module (organizes files by module).
 * - uuid:     Random UUID per file (avoids collisions, no predictable paths).
 * - ext:      File extension (e.g. pdf, mp4, png).
 *
 * Lesson records in public.training_lessons store this path in storage_path.
 * Staff view content via short-lived signed URLs generated from storage_path.
 *
 * Client-side uploads: the Add lesson form uploads files directly from the browser.
 * The bucket must allow INSERT for authenticated users (e.g. RLS policy permitting
 * auth.role() = 'authenticated' or restrict to admin via profiles).
 */

export const TRAINING_CONTENT_BUCKET = "training-content";

/** Max file size for lesson uploads (100 MB). */
export const MAX_LESSON_FILE_BYTES = 100 * 1024 * 1024;

export const ALLOWED_VIDEO_EXTENSIONS = [
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "m4v",
] as const;

export const ALLOWED_PDF_EXTENSIONS = ["pdf"] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"] as const;

export const ALLOWED_CSV_EXTENSIONS = ["csv"] as const;

export const ALLOWED_EXTENSIONS_BY_TYPE = {
  video: ALLOWED_VIDEO_EXTENSIONS,
  pdf: ALLOWED_PDF_EXTENSIONS,
  image: ALLOWED_IMAGE_EXTENSIONS,
  csv: ALLOWED_CSV_EXTENSIONS,
} as const;

export type LessonMediaType = keyof typeof ALLOWED_EXTENSIONS_BY_TYPE;
