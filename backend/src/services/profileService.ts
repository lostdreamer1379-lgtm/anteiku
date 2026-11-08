import { prisma } from "../lib/prisma.js";
import type { UpdateProfileSchema } from "../validators/profile.js";
import type { z } from "zod";
import { ApiError } from "../middleware/errorHandler.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

type UpdateInput = z.infer<typeof UpdateProfileSchema>;

// Ensure a Profile row exists for the given Supabase Auth UUID.
// Called lazily on first authenticated request that touches user data.
export async function ensureProfile(userId: string) {
  return prisma.profile.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });
}

export async function getProfile(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile) throw new ApiError(404, "Profile not found");
  return profile;
}

export async function updateProfile(userId: string, input: UpdateInput) {
  await ensureProfile(userId);

  if (input.username) {
    const conflict = await prisma.profile.findFirst({
      where: { username: input.username, NOT: { id: userId } },
    });
    if (conflict) throw new ApiError(409, "Username already taken");
  }

  return prisma.profile.update({
    where: { id: userId },
    data: {
      ...(input.username !== undefined && { username: input.username }),
      ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
    },
  });
}

export async function deleteAccount(userId: string) {
  // The relation cascades remove the user's profile, watchlist, and progress.
  await prisma.profile.deleteMany({ where: { id: userId } });

  if (!supabaseAdmin) {
    throw new ApiError(503, "Authentication service is not configured on the backend");
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    throw new ApiError(502, "Could not delete the authentication account. Please try again.");
  }
}
