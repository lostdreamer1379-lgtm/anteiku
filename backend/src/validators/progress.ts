import { z } from "zod";

export const UpsertProgressSchema = z.object({
  animeId: z.number().int().positive(),
  episodeNumber: z.number().int().positive(),
  progressSeconds: z.number().int().min(0).default(0),
  completed: z.boolean().default(false),
});

export const PatchProgressSchema = z.object({
  progressSeconds: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});
