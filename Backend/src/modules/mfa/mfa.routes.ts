import { Router } from "express";
import {
  setupMFAController,
  verifyMFAController,
  enableMFAController,
  disableMFAController,
} from "./mfa.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/setup", authenticate, setupMFAController);
router.post("/verify", authenticate, verifyMFAController);
router.post("/enable", authenticate, enableMFAController);
router.post("/disable", authenticate, disableMFAController);

export default router;
