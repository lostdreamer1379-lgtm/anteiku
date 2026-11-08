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

  // Handle browser preflight explicitly. This keeps serverless deployments
  // from returning a headerless response before the cors package runs.
  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin?.replace(/\/+$/, "");
    if (requestOrigin && env.frontendOrigins.includes(requestOrigin)) {
      res.header("Access-Control-Allow-Origin", requestOrigin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Vary", "Origin");
    }

    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.status(204).end();
      return;
    }

    next();
  });

  app.use(helmet());
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin || env.frontendOrigins.includes(requestOrigin.replace(/\/+$/, ""))) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
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
