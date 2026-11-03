import type { Request } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../middleware/errorHandler.js";

export function parseBody<T>(req: Request, schema: ZodSchema<T>): T {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(", ");
    throw new ApiError(400, `Validation error: ${message}`);
  }
  return result.data;
}

export function parseParams<T>(params: unknown, schema: ZodSchema<T>): T {
  const result = schema.safeParse(params);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(", ");
    throw new ApiError(400, `Invalid parameters: ${message}`);
  }
  return result.data;
}
