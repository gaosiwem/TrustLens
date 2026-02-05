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

    // 0. Check for pending claims
    const pendingClaims = await prisma.brandClaim.count({
      where: { userId, status: "PENDING" },
    });
    const hasPendingClaim = pendingClaims > 0;

    // 1. Check for managed brands (regardless of role to handle role sync lag)
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
        subscriptions: {
          where: { status: "ACTIVE" },
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

    const isBrandManager = brands.length > 0;

    // If they have brands OR the role is explicitly BRAND, return brand dashboard
    if (
      role === "BRAND" ||
      isBrandManager ||
      role === "ADMIN" ||
      role === "SUPER_ADMIN"
    ) {
      const hasVerifiedBrand = brands.some((b) => b.isVerified);

      const managedBrands = brands.map((b) => {
        const verifiedSub = b.subscriptions.find((s) =>
          s.plan.code.includes("VERIFIED"),
        );
        const activeSub = verifiedSub || b.subscriptions[0] || null;

        return {
          ...b,
          subscription: activeSub
            ? {
                ...activeSub,
                verifiedUntil: activeSub.endsAt,
              }
            : null,
          subscriptions: b.subscriptions,
        };
      });

      if (managedBrands.length === 0) {
        // Only get here if role is BRAND/ADMIN but no brands are managed yet
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
          managedBrands: [],
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

    // Default USER dashboard
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
      managedBrands: [],
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
