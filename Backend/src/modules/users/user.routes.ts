import { Router } from "express";
import {
  authenticate,
  authenticateAdmin,
} from "../../middleware/auth.middleware.js";
import {
  getUsersController,
  getUserProfileController,
  updateUserProfileController,
  adminUpdateUserController,
} from "./user.controller.js";

const router = Router();

// Admin only: List all users
router.get("/", authenticate, authenticateAdmin, getUsersController);
router.patch(
  "/:id",
  authenticate,
  authenticateAdmin,
  adminUpdateUserController
);

// Authenticated users: Profile management
router.get("/me", authenticate, getUserProfileController);
router.put("/me", authenticate, updateUserProfileController);

export default router;
