import { Router } from "express";
import { trackBadgeClick } from "./analytics.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// Allow unauthenticated tracking for guest users viewing public profiles?
// For now, let's allow it but maybe rate limit or just log as "GUEST" if not auth.
// If using `authenticate` middleware, it might block guests.
// We should check if `authenticate` is strict.
// Assuming public profile is public, tracking should be public too.
// Let's make it optional auth or separate.
// For simplicity, we'll try to use a permissive approach or separate middleware if needed.
// But mostly we expect users to be logged in to view Dashboard stats,
// but clicking the badge happens on Public Profile.
// So we should NOT require strict auth.

router.post("/brands/:brandId/badge-click", trackBadgeClick);

export default router;
