import { z } from "zod";

export const createQuizSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional().nullable(),
  passing_score_percent: z.number().int().min(0).max(100).optional(),
});

export const updateQuizSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  passing_score_percent: z.number().int().min(0).max(100).optional(),
});

export const createQuestionSchema = z.object({
  quiz_id: z.string().uuid(),
  question_text: z.string().min(1, "Question text is required"),
  sort_order: z.number().int().min(0).optional(),
});

export const createOptionSchema = z.object({
  question_id: z.string().uuid(),
  option_text: z.string().min(1, "Option text is required"),
  is_correct: z.boolean(),
  sort_order: z.number().int().min(0).optional(),
});

export const submitQuizSchema = z.object({
  quiz_id: z.string().uuid(),
  answers: z.array(
    z.object({
      question_id: z.string().uuid(),
      option_id: z.string().uuid(),
    })
  ),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type CreateOptionInput = z.infer<typeof createOptionSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
