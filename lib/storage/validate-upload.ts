import {
  MAX_LESSON_FILE_BYTES,
  ALLOWED_EXTENSIONS_BY_TYPE,
  type LessonMediaType,
} from "./constants";

export type ValidateLessonFileResult =
  | { success: true; ext: string }
  | { success: false; error: string };

/**
 * Validates file for lesson upload: type matches allowed extensions for content_type,
 * size within limit. Returns safe extension or error message.
 */
export function validateLessonFile(
  file: File,
  contentType: LessonMediaType
): ValidateLessonFileResult {
  if (!file.size) {
    return { success: false, error: "File is empty." };
  }

  if (file.size > MAX_LESSON_FILE_BYTES) {
    const maxMb = MAX_LESSON_FILE_BYTES / (1024 * 1024);
    return {
      success: false,
      error: `File is too large. Maximum size is ${maxMb} MB.`,
    };
  }

  const allowed = ALLOWED_EXTENSIONS_BY_TYPE[contentType];
  const rawExt = (file.name.split(".").pop() ?? "").toLowerCase();
  const ext = rawExt.replace(/[^a-z0-9]/g, "");

  if (!ext) {
    return { success: false, error: "File must have an extension (e.g. .pdf, .mp4)." };
  }

  if (!(allowed as readonly string[]).includes(ext)) {
    const list = (allowed as readonly string[]).join(", .");
    return {
      success: false,
      error: `Invalid file type for ${contentType}. Allowed: .${list}`,
    };
  }

  return { success: true, ext };
}
