import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  createRatingController,
  getRatingsController,
  getUserRatingController,
  getRecentRatingsController,
} from "./rating.controller.js";

const router = Router();

router.get("/public/recent", getRecentRatingsController);
router.post("/", authenticate, createRatingController);
router.get("/:complaintId", getRatingsController);
router.get("/:complaintId/user", authenticate, getUserRatingController);

export default router;
