import { Router } from "express";
import {
  getNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  getUnreadCountController,
  getPreferencesController,
  updatePreferencesController,
} from "./notification.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getNotificationsController);
router.get("/unread-count", authenticate, getUnreadCountController);
router.get("/preferences", authenticate, getPreferencesController);
router.patch("/preferences", authenticate, updatePreferencesController);
router.patch("/:id/read", authenticate, markNotificationReadController);
router.patch(
  "/mark-all-read",
  authenticate,
  markAllNotificationsReadController
);

export default router;
