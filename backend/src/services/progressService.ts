import { prisma } from "../lib/prisma.js";
import { ensureProfile } from "./profileService.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function getProgress(userId: string) {
  await ensureProfile(userId);
  return prisma.watchProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function upsertProgress(
  userId: string,
  animeId: number,
  episodeNumber: number,
  progressSeconds: number,
  completed: boolean
) {
  await ensureProfile(userId);
  return prisma.watchProgress.upsert({
    where: { userId_animeId_episodeNumber: { userId, animeId, episodeNumber } },
    update: { progressSeconds, completed },
    create: { userId, animeId, episodeNumber, progressSeconds, completed },
  });
}

export async function patchProgress(
  userId: string,
  progressId: string,
  fields: { progressSeconds?: number; completed?: boolean }
) {
  const record = await prisma.watchProgress.findUnique({ where: { id: progressId } });
  if (!record) throw new ApiError(404, "Progress record not found");
  if (record.userId !== userId) throw new ApiError(403, "Forbidden");

  return prisma.watchProgress.update({
    where: { id: progressId },
    data: {
      ...(fields.progressSeconds !== undefined && { progressSeconds: fields.progressSeconds }),
      ...(fields.completed !== undefined && { completed: fields.completed }),
    },
  });
}
