import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as watchlistController from "../controllers/watchlistController.js";

export const watchlistRouter = Router();

watchlistRouter.use(requireAuth);
watchlistRouter.get("/", watchlistController.getWatchlist);
watchlistRouter.post("/", watchlistController.addToWatchlist);
watchlistRouter.patch("/:id", watchlistController.updateWatchlistEntry);
watchlistRouter.delete("/:id", watchlistController.removeFromWatchlist);
