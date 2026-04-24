import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const trainingCategorySlugSchema = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .refine((s) => s.length >= 1 && s.length <= 120, { message: "Slug is required" })
  .refine((s) => slugPattern.test(s), {
    message: "Use lowercase letters, numbers, and single hyphens (e.g. home-healthcare).",
  });

function optionalText(max: number) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null) return null;
      const t = String(v).trim();
      return t === "" ? null : t;
    })
    .pipe(z.union([z.string().max(max), z.null()]));
}

export const createTrainingCategorySchema = z.object({
  name: z.preprocess((v) => String(v ?? ""), z.string().trim().min(1, "Name is required").max(200)),
  slug: z.preprocess((v) => String(v ?? ""), trainingCategorySlugSchema),
  description: optionalText(2000),
  icon: optionalText(120),
  display_order: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? 0 : Number(v)),
    z.number().int().min(0).max(10_000)
  ),
  is_active: z.preprocess(
    (v) => v === true || v === "on" || v === "true",
    z.boolean()
  ),
});

export const updateTrainingCategorySchema = createTrainingCategorySchema;

export type CreateTrainingCategoryInput = z.infer<typeof createTrainingCategorySchema>;
export type UpdateTrainingCategoryInput = z.infer<typeof updateTrainingCategorySchema>;
