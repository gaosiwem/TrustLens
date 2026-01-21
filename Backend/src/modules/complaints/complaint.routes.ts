import { Router } from "express";
import {
  createComplaintController,
  updateStatusController,
  listComplaintsController,
  getComplaintByIdController,
  publicRecentComplaintsController,
  searchComplaintsController,
} from "./complaint.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";
import { getClustersController } from "../clusters/cluster.controller.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.array("attachments", 5),
  createComplaintController
);
router.get("/", authenticate, listComplaintsController);
router.get("/public/search", searchComplaintsController);
router.get("/public/recent", publicRecentComplaintsController);
router.get("/:id", getComplaintByIdController);
router.get(
  "/moderation",
  authenticate,
  requireRole("MODERATOR"),
  listComplaintsController
);
router.get("/clusters", getClustersController);
router.patch(
  "/:id/status",
  authenticate,
  requireRole("MODERATOR"),
  updateStatusController
);

export default router;
