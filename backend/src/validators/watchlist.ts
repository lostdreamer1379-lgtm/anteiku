import { z } from "zod";

export const WatchStatusSchema = z.enum([
  "WATCHING",
  "COMPLETED",
  "PLANNING",
  "PAUSED",
  "DROPPED",
]);

export const CreateWatchlistSchema = z.object({
  animeId: z.number().int().positive(),
  status: WatchStatusSchema,
});

export const PatchWatchlistSchema = z.object({
  status: WatchStatusSchema,
});
