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

  if (env.nodeEnv !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    error: true,
    message,
    ...(env.nodeEnv !== "production" && err instanceof Error ? { stack: err.stack } : {}),
  });
};
