import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as profileController from "../controllers/profileController.js";

export const profileRouter = Router();

profileRouter.use(requireAuth);
profileRouter.get("/", profileController.getProfile);
profileRouter.put("/", profileController.updateProfile);
