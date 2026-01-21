import { Router } from "express";
import {
  authenticate,
  authenticateAdmin,
} from "../../middleware/auth.middleware.js";
import {
  requestVerification,
  getPendingRequests,
  processRequest,
  getBrandVerificationStatus,
  getDocuments,
  getVerificationAnalytics,
} from "./verification.controller.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();

// Brand routes
router.get("/status", authenticate, getBrandVerificationStatus);
router.post(
  "/request",
  authenticate,
  upload.single("file"),
  requestVerification
);
router.get("/documents", authenticate, getDocuments);
router.get("/analytics", authenticate, getVerificationAnalytics);

// Admin routes
router.get(
  "/admin/pending",
  authenticate,
  authenticateAdmin,
  getPendingRequests
);
router.post("/admin/process", authenticate, authenticateAdmin, processRequest);

export default router;
