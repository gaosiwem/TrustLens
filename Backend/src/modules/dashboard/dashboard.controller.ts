import type { Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import {
  getDashboardMetrics,
  getComplaintTrends,
  getStatusDistribution,
  getAIInsights,
  getBrandDashboardMetrics,
  getBrandComplaintTrends,
  getBrandStatusDistribution,
  getBrandInsights,
  getBrandComplaintList,
} from "./dashboard.service.js";

export async function dashboardController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 0. Check if this user has any pending brand claims (applicable to all roles)
    const pendingClaims = await prisma.brandClaim.count({
      where: { userId, status: "PENDING" },
    });
    const hasPendingClaim = pendingClaims > 0;

    // BRAND users get brand-specific dashboard
    if (role === "BRAND") {
      // 1. Find which brands this user manages
      const brands = await prisma.brand.findMany({
        where: { managerId: userId },
        select: {
          id: true,
          name: true,
          isVerified: true,
          logoUrl: true,
          description: true,
          websiteUrl: true,
          supportEmail: true,
          supportPhone: true,
          subscription: {
            select: {
              status: true,
              endsAt: true,
              plan: {
                select: {
                  code: true,
                },
              },
            },
          },
        },
      });

      // 2. Already checked for pending claims globally above
      const hasVerifiedBrand = brands.some((b) => b.isVerified);

      // Map to include verifiedUntil alias for frontend compatibility
      const managedBrands = brands.map((b) => ({
        ...b,
        subscription: b.subscription
          ? {
              ...b.subscription,
              verifiedUntil: b.subscription.endsAt,
            }
          : null,
      }));

      if (managedBrands.length === 0) {
        // No managed brands, return empty dashboard but with claim info
        return res.json({
          metrics: {
            totalComplaints: 0,
            resolved: 0,
            pending: 0,
            needsInfo: 0,
            underReview: 0,
          },
          trends: [],
          statusDistribution: [],
          insights: {
            topIssue: "No managed brands found",
            resolutionSuggestion:
              "Please claim a brand to start managing complaints",
            resolutionRate: 0,
          },
          hasVerifiedBrand: false,
          hasPendingClaim,
        });
      }

      // Get all brand IDs
      const brandIds = managedBrands.map((b) => b.id);

      const [metrics, trends, statusDist, insights] = await Promise.all([
        getBrandDashboardMetrics(brandIds),
        getBrandComplaintTrends(brandIds),
        getBrandStatusDistribution(brandIds),
        getBrandInsights(brandIds),
      ]);

      return res.json({
        metrics,
        trends,
        statusDistribution: statusDist,
        insights,
        managedBrands,
        hasVerifiedBrand,
        hasPendingClaim,
      });
    }

    const [metrics, trends, statusDist, insights] = await Promise.all([
      getDashboardMetrics(userId),
      getComplaintTrends(userId),
      getStatusDistribution(userId),
      getAIInsights(userId),
    ]);

    res.json({
      metrics,
      trends,
      statusDistribution: statusDist,
      insights,
      hasPendingClaim,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getBrandComplaintsController(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || role !== "BRAND") {
      return res.status(403).json({ error: "Access denied" });
    }

    // 1. Find which brands this user manages
    const managedBrands = await prisma.brand.findMany({
      where: { managerId: userId },
      select: { id: true },
    });

    if (managedBrands.length === 0) {
      return res.json({ total: 0, items: [] });
    }

    const brandIds = managedBrands.map((b) => b.id);

    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await getBrandComplaintList({
      brandIds,
      limit,
      offset,
      sortBy,
      sortOrder,
      status,
      search,
    });

    res.json(result);
  } catch (error: any) {
    console.error("Get brand complaints error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
