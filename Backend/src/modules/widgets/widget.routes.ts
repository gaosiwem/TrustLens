import { Router } from "express";
import {
  validateWidgetController,
  getWidgetResolutionsController,
  getWidgetMetricsController,
} from "./widget.controller.js";

const router = Router();

// Public widget routes
router.post("/validate", validateWidgetController);
router.get("/resolutions", getWidgetResolutionsController);
router.get("/metrics", getWidgetMetricsController);

export default router;
