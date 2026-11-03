import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ok, created } from "../utils/response.js";
import { parseBody, parseParams } from "../utils/validate.js";
import { UpsertProgressSchema, PatchProgressSchema } from "../validators/progress.js";
import * as progressService from "../services/progressService.js";

export async function getProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const records = await progressService.getProgress(req.userId!);
    ok(res, records);
  } catch (err) {
    next(err);
  }
}

export async function upsertProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const { animeId, episodeNumber, progressSeconds, completed } = parseBody(
      req,
      UpsertProgressSchema
    );
    const record = await progressService.upsertProgress(
      req.userId!,
      animeId,
      episodeNumber,
      progressSeconds ?? 0,
      completed ?? false
    );
    created(res, record);
  } catch (err) {
    next(err);
  }
}

export async function patchProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = parseParams(req.params, z.object({ id: z.string().uuid() }));
    const fields = parseBody(req, PatchProgressSchema);
    const record = await progressService.patchProgress(req.userId!, id, fields);
    ok(res, record);
  } catch (err) {
    next(err);
  }
}
