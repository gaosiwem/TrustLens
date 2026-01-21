import { Router } from "express";
import * as governanceController from "./governance.controller.js";
import {
  authenticate,
  authenticateAdmin,
} from "../../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/escalations",
  authenticate,
  authenticateAdmin,
  governanceController.getEscalations
);
router.get(
  "/enforcements",
  authenticate,
  authenticateAdmin,
  governanceController.getEnforcements
);
router.post(
  "/escalations/:id/resolve",
  authenticate,
  authenticateAdmin,
  governanceController.resolveEscalation
);
router.get(
  "/heatmap",
  authenticate,
  authenticateAdmin,
  governanceController.getHeatmap
);

export default router;
