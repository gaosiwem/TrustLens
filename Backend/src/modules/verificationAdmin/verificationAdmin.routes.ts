import { Router } from "express";
import {
  authenticate,
  authenticateAdmin,
} from "../../middleware/auth.middleware.js";
import * as adminController from "./verificationAdmin.controller.js";

const router = Router();

// All routes here require admin access
router.use(authenticate, authenticateAdmin);

router.get("/overview", adminController.getOverview);
router.get("/revenue", adminController.getRevenue);
router.get("/sla", adminController.getSLA);
router.get("/fraud", adminController.getFraud);
router.get("/audits", adminController.getAudits);

export default router;
