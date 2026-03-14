import { z } from "zod";

export const contentTypeEnum = z.enum(["video", "pdf", "image"]);

export const createContentSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  content_type: contentTypeEnum,
  /** Omitted for upload flow (path is set after file upload). */
  storage_path: z.string().min(1).optional(),
  sort_order: z.number().int().min(0).optional(),
});

export const updateContentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content_type: contentTypeEnum.optional(),
  storage_path: z.string().min(1).optional(),
  sort_order: z.number().int().min(0).optional(),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
