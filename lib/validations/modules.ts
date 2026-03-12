import { z } from "zod";

export const createModuleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
});

export const updateModuleSchema = createModuleSchema.extend({
  is_published: z.boolean().optional(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
