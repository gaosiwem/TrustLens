import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import brandRoutes from "./modules/brands/brand.routes.js";
import complaintRoutes from "./modules/complaints/complaint.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import followupRoutes from "./modules/followups/followup.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import mfaRoutes from "./modules/mfa/mfa.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";
import metricsRoutes from "./modules/metrics/metrics.routes.js";
import ratingRoutes from "./modules/ratings/rating.routes.js";
import subscriptionRoutes from "./modules/subscription/subscription.routes.js";
import billingRoutes from "./modules/billing/billing.routes.js";
import verificationRoutes from "./modules/verification/verification.routes.js";
import verificationAdminRoutes from "./modules/verificationAdmin/verificationAdmin.routes.js";
import governanceRoutes from "./modules/governance/governance.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { healthCheck } from "./controllers/health.controller.js";
import { requestLogger } from "./middleware/logging.middleware.js";

const app = express();

// Global Request Logging
app.use(requestLogger);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Rate limiting
app.use(apiLimiter);

// Health check (no auth required)
app.get("/health", healthCheck);

// Debug: List all routes (Development only)
app.get("/debug/routes", (req, res) => {
  const routes: any[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push(
        `${Object.keys(middleware.route.methods)} ${middleware.route.path}`,
      );
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods);
          routes.push(`${methods} ${middleware.regexp.toString()} ${path}`);
        }
      });
    }
  });
  res.json(routes);
});

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/brands", brandRoutes);
app.use("/complaints", complaintRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/notifications", notificationRoutes);
app.use("/followups", followupRoutes);
app.use("/admin", adminRoutes);
app.use("/mfa", mfaRoutes);
app.use("/audit", auditRoutes);
app.use("/metrics", metricsRoutes);
app.use("/ratings", ratingRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/billing", billingRoutes);
app.use("/verified", verificationRoutes);
app.use("/admin/verification", verificationAdminRoutes);
app.use("/admin/governance", governanceRoutes);
app.use("/analytics", analyticsRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
