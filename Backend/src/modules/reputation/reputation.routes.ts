import { Router } from "express";
import {
  getBrandReputationController,
  recalculateBrandReputationController,
} from "./reputation.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

import { requireFeature } from "../../middleware/featureGate.js";

const router = Router();

router.get(
  "/:brandId",
  authenticate,
  requireFeature("aiInsights"),
  getBrandReputationController,
);
router.post(
  "/:brandId/recalculate",
  authenticate,
  requireFeature("aiInsights"),
  recalculateBrandReputationController,
);

export default router;
