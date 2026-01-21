import { Router } from "express";
import {
  getAuditController,
  getAuditStatsController,
} from "./audit.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/rbac.middleware.js";

const router = Router();

router.get("/", authenticate, requireAdmin, getAuditController);
router.get("/stats", authenticate, requireAdmin, getAuditStatsController);

export default router;
