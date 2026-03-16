import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required").optional(),
  role: z.enum(["staff", "admin"]),
});

export const updateRoleSchema = z.object({
  profileId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export const deleteUserSchema = z.object({
  userId: z.string().uuid(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
