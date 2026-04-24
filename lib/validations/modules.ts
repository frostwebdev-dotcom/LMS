import { z } from "zod";
import { DEFAULT_TRAINING_CATEGORY_ID } from "@/lib/constants/default-training-category";

const baseModuleFields = {
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
  expiration_months: z.number().int().min(1).max(120).optional().nullable(),
};

/** Create: empty/missing category → default Homecare (matches DB DEFAULT). */
const moduleCategoryIdForCreate = z.preprocess(
  (v) =>
    v === "" || v === null || v === undefined ? DEFAULT_TRAINING_CATEGORY_ID : v,
  z.string().uuid()
);

/** Update: category must be chosen explicitly (no silent default). */
const moduleCategoryIdForUpdate = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? "" : v),
  z.string().min(1, "Select a training category").uuid()
);

export const createModuleSchema = z.object({
  ...baseModuleFields,
  category_id: moduleCategoryIdForCreate,
});

export const updateModuleSchema = z.object({
  ...baseModuleFields,
  category_id: moduleCategoryIdForUpdate,
  is_published: z.boolean().optional(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
