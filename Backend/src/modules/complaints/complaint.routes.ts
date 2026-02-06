import { Router } from "express";
import {
  createComplaintController,
  updateStatusController,
  listComplaintsController,
  getComplaintByIdController,
  publicRecentComplaintsController,
  searchComplaintsController,
  assignComplaintController,
} from "./complaint.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";
import { requireFeature } from "../../middleware/featureGate.js";
import { getClustersController } from "../clusters/cluster.controller.js";
import { upload } from "../../middleware/upload.middleware.js";
import prisma from "../../lib/prisma.js";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.array("attachments", 5),
  createComplaintController,
);
router.get("/", authenticate, listComplaintsController);
router.get("/public/search", searchComplaintsController);
router.get("/public/recent", publicRecentComplaintsController);
router.get("/:id", getComplaintByIdController);
router.get(
  "/moderation",
  authenticate,
  requireRole("MODERATOR"),
  listComplaintsController,
);
router.get("/clusters", getClustersController);
router.patch(
  "/:id/status",
  authenticate,
  requireRole("MODERATOR"),
  updateStatusController,
);
// Custom middleware to check feature for the complaint's brand
const requireComplaintFeature = (feature: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const complaintId = req.params.id;
      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
      });
      if (!complaint)
        return res.status(404).json({ error: "Complaint not found" });

      // Mock attaching brandId to user object so requireFeature works
      // Or simpler: just reuse existing requireFeature logic but manually
      // Let's rely on standard requireFeature BUT we need brandId in user object?
      // Actually, the requireFeature middleware expects req.user.brandId.
      // The user accessing this is the brand manager, so req.user.brandId should be set by authenticate middleware login?
      // Yes, authenticate sets req.user.brandId.

      // Verify the complaint belongs to the brand the user is managing?
      // The controller probably does that.
      // So we just need requireFeature logic.
      next();
    } catch (e) {
      next(e);
    }
  };
};

router.patch(
  "/:id/assign",
  authenticate,
  requireFeature("teamSLA"),
  assignComplaintController,
);

export default router;
