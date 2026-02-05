import { Router, type Request, type Response } from "express";
import {
  platformStatsController,
  submissionTrendController,
  resolutionTrendController,
  statusBreakdownController,
  adminComplaintsController,
} from "./admin.controller.js";
import {
  authenticate,
  authenticateAdmin,
} from "../../middleware/auth.middleware.js";
import prisma from "../../lib/prisma.js";
import { processBrandClaim } from "../brands/brand.service.js";
import {
  getRevenueSummary,
  getMonthlyRevenue,
  getBrandInvoices,
} from "./billing.controller.js";
import { adminFinanceOnly } from "../../middleware/adminFinanceOnly.js";
import type { BrandClaimStatus } from "@prisma/client";

const router = Router();

// All admin routes require authentication and admin role
router.get("/stats", authenticate, authenticateAdmin, platformStatsController);
router.get(
  "/trend/submissions",
  authenticate,
  authenticateAdmin,
  submissionTrendController,
);
router.get(
  "/trend/resolutions",
  authenticate,
  authenticateAdmin,
  resolutionTrendController,
);
router.get(
  "/status-breakdown",
  authenticate,
  authenticateAdmin,
  statusBreakdownController,
);
router.get(
  "/complaints",
  authenticate,
  authenticateAdmin,
  adminComplaintsController,
);

// Billing & Revenue (Financial Roles Only)
router.get(
  "/billing/summary",
  authenticate,
  adminFinanceOnly,
  getRevenueSummary,
);
router.get(
  "/billing/revenue-monthly",
  authenticate,
  adminFinanceOnly,
  getMonthlyRevenue,
);
router.get(
  "/billing/brand-invoices/:brandId",
  authenticate,
  adminFinanceOnly,
  getBrandInvoices,
);

// Get pending brand ownership claims
router.get(
  "/brand-claims",
  authenticate,
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { status = "PENDING" } = req.query;
      const claims = await prisma.brandClaim.findMany({
        where: {
          status: status as BrandClaimStatus,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(claims);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update brand claim status
router.patch(
  "/brand-claims/:id/status",
  authenticate,
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: BrandClaimStatus };

      if (!id || !status) {
        return res.status(400).json({ error: "ID and status are required" });
      }

      const updatedClaim = await processBrandClaim(id, status as any);
      res.json(updatedClaim);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
