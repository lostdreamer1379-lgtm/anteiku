import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ok, created } from "../utils/response.js";
import { parseBody, parseParams } from "../utils/validate.js";
import { CreateWatchlistSchema, PatchWatchlistSchema } from "../validators/watchlist.js";
import * as watchlistService from "../services/watchlistService.js";
import type { WatchStatus } from "@prisma/client";

export async function getWatchlist(req: Request, res: Response, next: NextFunction) {
  try {
    const entries = await watchlistService.getWatchlist(req.userId!);
    ok(res, entries);
  } catch (err) {
    next(err);
  }
}

export async function addToWatchlist(req: Request, res: Response, next: NextFunction) {
  try {
    const { animeId, status } = parseBody(req, CreateWatchlistSchema);
    const entry = await watchlistService.addToWatchlist(req.userId!, animeId, status as WatchStatus);
    created(res, entry);
  } catch (err) {
    next(err);
  }
}

export async function updateWatchlistEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = parseParams(req.params, z.object({ id: z.string().uuid() }));
    const { status } = parseBody(req, PatchWatchlistSchema);
    const entry = await watchlistService.updateWatchlistEntry(req.userId!, id, status as WatchStatus);
    ok(res, entry);
  } catch (err) {
    next(err);
  }
}

export async function removeFromWatchlist(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = parseParams(req.params, z.object({ id: z.string().uuid() }));
    await watchlistService.removeFromWatchlist(req.userId!, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
