import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { ApiError } from "./errorHandler.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError(503, "Authentication service is not configured on the backend");
    }
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "Missing bearer token");
    }
    const token = header.slice("Bearer ".length);

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      throw new ApiError(401, "Invalid or expired session");
    }

    req.userId = data.user.id;
    next();
  } catch (err) {
    next(err);
  }
}
