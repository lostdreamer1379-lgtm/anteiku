import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof ApiError ? err.status : 500;
  const message = err instanceof ApiError ? err.message : "Internal server error";

  // Keep the client response safe, but always preserve the real server error
  // in Vercel logs so database/auth configuration failures are diagnosable.
  // eslint-disable-next-line no-console
  console.error(`[api] ${status} ${message}`, err);

  res.status(status).json({
    error: true,
    message,
    ...(env.nodeEnv !== "production" && err instanceof Error ? { stack: err.stack } : {}),
  });
};
