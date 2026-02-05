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

      const subscriptions = await prisma.brandSubscription.findMany({
        where: { brandId, status: "ACTIVE" },
        include: { plan: true },
      });

      // Merge features from all active subscriptions
      const mergedFeatures: Record<string, any> = {
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

      for (const sub of subscriptions) {
        const planFeatures = sub.plan.features as any;
        if (planFeatures) {
          for (const [key, value] of Object.entries(planFeatures)) {
            if (typeof value === "boolean") {
              mergedFeatures[key] = mergedFeatures[key] || value;
            } else if (typeof value === "number") {
              mergedFeatures[key] = Math.max(mergedFeatures[key] || 0, value);
            }
          }
        }
      }

      if (!mergedFeatures[feature]) {
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
