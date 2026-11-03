import type { NextFunction, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { ApiError } from "./errorHandler.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseJwtSecret);

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
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
