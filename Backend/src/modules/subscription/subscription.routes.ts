import { Router } from "express";
import * as subscriptionController from "./subscription.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/checkout",
  authenticate,
  subscriptionController.createCheckoutSession,
);
router.post("/webhook", subscriptionController.handleWebhook);
router.get(
  "/current",
  authenticate,
  subscriptionController.getCurrentSubscription,
);
router.post(
  "/dev-activate",
  authenticate,
  subscriptionController.activateDevSubscription,
);

export default router;
