import { Router } from "express";
import {
  getMetricsController,
  getHealthController,
  getUsageController,
} from "./metrics.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/rbac.middleware.js";

const router = Router();

router.get("/", authenticate, requireAdmin, getMetricsController);
router.get("/health", getHealthController); // Public endpoint
router.get("/usage", authenticate, requireAdmin, getUsageController);

export default router;
