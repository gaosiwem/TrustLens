import { Router } from "express";
import {
  dashboardController,
  getBrandComplaintsController,
} from "./dashboard.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, dashboardController);
router.get("/complaints", authenticate, getBrandComplaintsController);

export default router;
