import type { Request, Response, NextFunction } from "express";
import { ok } from "../utils/response.js";
import { parseBody } from "../utils/validate.js";
import { UpdateProfileSchema } from "../validators/profile.js";
import * as profileService from "../services/profileService.js";

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.getProfile(req.userId!);
    ok(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const input = parseBody(req, UpdateProfileSchema);
    const profile = await profileService.updateProfile(req.userId!, input);
    ok(res, profile);
  } catch (err) {
    next(err);
  }
}
