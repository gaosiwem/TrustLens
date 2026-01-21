import { Router } from "express";
import {
  registerController,
  loginController,
  googleLoginController,
} from "./auth.controller.js";

const router = Router();
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/google", googleLoginController);

export default router;
