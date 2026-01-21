import { Router } from "express";
import {
  addFollowupController,
  getFollowupsController,
  deleteFollowupController,
} from "./followup.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, addFollowupController);
router.get("/:complaintId", authenticate, getFollowupsController);
router.delete("/:id", authenticate, deleteFollowupController);

export default router;
