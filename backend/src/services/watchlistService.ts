import { prisma } from "../lib/prisma.js";
import { ensureProfile } from "./profileService.js";
import { ApiError } from "../middleware/errorHandler.js";
import type { WatchStatus } from "@prisma/client";

export async function getWatchlist(userId: string) {
  await ensureProfile(userId);
  return prisma.watchlistEntry.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function addToWatchlist(
  userId: string,
  animeId: number,
  status: WatchStatus
) {
  await ensureProfile(userId);
  // Upsert: if the user already has this anime, just update the status.
  return prisma.watchlistEntry.upsert({
    where: { userId_animeId: { userId, animeId } },
    update: { status },
    create: { userId, animeId, status },
  });
}

export async function updateWatchlistEntry(
  userId: string,
  entryId: string,
  status: WatchStatus
) {
  const entry = await prisma.watchlistEntry.findUnique({ where: { id: entryId } });
  if (!entry) throw new ApiError(404, "Watchlist entry not found");
  // Ownership check — the backend must not trust client-supplied user ids.
  if (entry.userId !== userId) throw new ApiError(403, "Forbidden");

  return prisma.watchlistEntry.update({
    where: { id: entryId },
    data: { status },
  });
}

export async function removeFromWatchlist(userId: string, entryId: string) {
  const entry = await prisma.watchlistEntry.findUnique({ where: { id: entryId } });
  if (!entry) throw new ApiError(404, "Watchlist entry not found");
  if (entry.userId !== userId) throw new ApiError(403, "Forbidden");

  await prisma.watchlistEntry.delete({ where: { id: entryId } });
}
