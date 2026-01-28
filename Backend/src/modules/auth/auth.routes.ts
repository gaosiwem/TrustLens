import { Router } from "express";
import {
  registerController,
  loginController,
  googleLoginController,
  requestPasswordResetController,
  resetPasswordController,
} from "./auth.controller.js";

const router = Router();
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/google", googleLoginController);
router.post("/forgot-password", requestPasswordResetController);
router.post("/reset-password", resetPasswordController);

export default router;
