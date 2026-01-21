import type { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function requireFeature(feature: string) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const brandId = req.user.brandId;

      if (!brandId) {
        return res
          .status(403)
          .json({ error: "Access denied. Brand profile required." });
      }

      const subscription = await prisma.brandSubscription.findUnique({
        where: { brandId },
        include: { plan: true },
      });

      // Default to FREE if no active subscription found
      const planFeatures =
        subscription?.status === "ACTIVE" && subscription.plan.features
          ? (subscription.plan.features as any)
          : {
              alerts: false,
              aiInsights: false,
              sentimentTracking: false,
              brandAudit: false,
              customDescription: false,
              trustTrend: false,
              riskSignals: false,
              rootCauseAI: false,
              teamSLA: false,
              historicalBenchmarking: false,
              apiAccess: false,
              customLLM: false,
              maxTeamSeats: 1,
            };

      if (!planFeatures[feature]) {
        return res.status(403).json({
          error: "Upgrade required",
          message: `The ${feature} feature is not available on your current plan.`,
        });
      }

      next();
    } catch (error) {
      console.error("Error in featureGate middleware:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
