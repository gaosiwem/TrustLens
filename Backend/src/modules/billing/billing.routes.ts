import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getBillingProfile,
  updateBillingProfile,
} from "./profile.controller.js";

const router = Router();

router.get("/profile", authenticate, getBillingProfile);
router.post("/profile", authenticate, updateBillingProfile);

export default router;
