import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { profileRouter } from "./routes/profile.js";
import { watchlistRouter } from "./routes/watchlist.js";
import { progressRouter } from "./routes/progress.js";
import { errorHandler, ApiError } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.frontendOrigin,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use("/api/health", healthRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/watchlist", watchlistRouter);
  app.use("/api/progress", progressRouter);

  app.use((_req, _res, next) => next(new ApiError(404, "Not found")));
  app.use(errorHandler);

  return app;
}
