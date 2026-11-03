import { z } from "zod";

export const UpdateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, _ and - are allowed")
    .optional(),
  avatarUrl: z.string().url().max(2048).optional().nullable(),
});
