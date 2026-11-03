import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as progressController from "../controllers/progressController.js";

export const progressRouter = Router();

progressRouter.use(requireAuth);
progressRouter.get("/", progressController.getProgress);
progressRouter.post("/", progressController.upsertProgress);
progressRouter.patch("/:id", progressController.patchProgress);
