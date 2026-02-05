import prisma from "../../lib/prisma.js";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  if (score >= 40) return "HIGH";
  return "CRITICAL";
}

export async function evaluateEntityTrust(
  entityType: "USER" | "BRAND",
  entityId: string,
  tx?: any,
) {
  const client = tx || prisma;
  let score = 100;
  let metadata: any = {};

  if (entityType === "BRAND") {
    // 1. Fetch Brand Data
    const brand = await client.brand.findUnique({
      where: { id: entityId },
      include: {
        subscriptions: { include: { plan: true } },
      },
    });

    if (!brand) throw new Error("Brand not found");

    // 2. Response Activity (Resolution Rate)
    const [totalComplaints, resolvedComplaints] = await Promise.all([
      client.complaint.count({ where: { brandId: entityId } }),
      client.complaint.count({
        where: { brandId: entityId, status: "RESOLVED" },
      }),
    ]);

    const resolutionRate =
      totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 100;
    const activityScore = Math.round(resolutionRate);

    // Activity Penalty
    if (resolutionRate < 50) score -= 20;
    if (resolutionRate < 30) score -= 20;

    // 3. Authenticity Score
    const totalResponses = await client.responderAuthenticityScore.count({
      where: { businessUserId: brand.managerId || "" },
    });
    const highRiskResponses = await client.responderAuthenticityScore.count({
      where: {
        businessUserId: brand.managerId || "",
        riskBand: "HIGH",
      },
    });

    const authenticityScore =
      totalResponses > 0
        ? Math.round(
            ((totalResponses - highRiskResponses) / totalResponses) * 100,
          )
        : 100;

    // Authenticity Penalty
    score -= highRiskResponses * 5;

    // 4. Verification Tier
    // Tier 1: Verified + Premium Plan (100%)
    // Tier 2: Verified (80%)
    // Tier 3: Unverified (60%)
    let verificationScore = 60;
    if (brand.isVerified) {
      verificationScore = 80;
      if (
        brand.subscriptions?.some(
          (s: any) => s.status === "ACTIVE" && s.plan.code.includes("PREMIUM"),
        )
      ) {
        verificationScore = 100;
      }
    }

    metadata = {
      factors: {
        authenticity: authenticityScore,
        activity: activityScore,
        verification: verificationScore,
      },
      calculation: {
        totalComplaints,
        resolvedComplaints,
        highRiskResponses,
        isVerified: brand.isVerified,
        // Find the "best" plan to display (Verified > Intelligence > Free)
        plan:
          brand.subscriptions?.find((s: any) =>
            s.plan.code.includes("VERIFIED"),
          )?.plan.name ||
          brand.subscriptions?.[0]?.plan.name ||
          "Free",
      },
    };
  } else {
    // User Trust Logic (Simplified for metadata consistency)
    const [total, rejected] = await Promise.all([
      client.complaint.count({ where: { userId: entityId } }),
      client.complaint.count({
        where: { userId: entityId, status: "REJECTED" },
      }),
    ]);

    if (total > 5) {
      const rejectionRate = rejected / total;
      if (rejectionRate > 0.4) score -= 30;
      if (rejectionRate > 0.7) score -= 40;
    }

    metadata = {
      factors: {
        validity:
          total > 0 ? Math.round(((total - rejected) / total) * 100) : 100,
      },
    };
  }

  score = Math.max(0, Math.min(100, score));
  const riskLevel = getRiskLevel(score);

  return client.trustScore.create({
    data: {
      entityType,
      entityId,
      score,
      riskLevel,
      metadata,
    },
  });
}

export async function getLatestTrustScore(
  entityType: "USER" | "BRAND",
  entityId: string,
  tx?: any,
) {
  const client = tx || prisma;
  return client.trustScore.findFirst({
    where: { entityType, entityId },
    orderBy: { evaluatedAt: "desc" },
  });
}

/**
 * Predicts the Trust Trend for the next 3 months using Linear Regression.
 * Returns null if insufficient data (< 2 data points).
 */
export async function predictTrustTrend(
  entityType: "USER" | "BRAND",
  entityId: string,
) {
  // 1. Fetch historical scores (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const history = await prisma.trustScore.findMany({
    where: {
      entityType,
      entityId,
      evaluatedAt: { gte: sixMonthsAgo },
    },
    orderBy: { evaluatedAt: "asc" },
  });

  if (history.length < 2) {
    return null; // Not enough data for a forecast
  }

  // 2. Perform Linear Regression (Least Squares)
  // X = Time (days from start), Y = Score
  if (!history[0]?.evaluatedAt) return null;
  const startTime = history[0].evaluatedAt.getTime();
  const points = history.map((h) => ({
    x: (h.evaluatedAt.getTime() - startTime) / (1000 * 60 * 60 * 24), // Days
    y: h.score,
  }));

  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumXX = points.reduce((acc, p) => acc + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 3. Project next 3 months (30, 60, 90 days from TODAY)
  // Note: the regression is based on days from history[0]
  const lastItem = history[history.length - 1];
  if (!lastItem?.evaluatedAt) return null;
  const lastDate = lastItem.evaluatedAt;
  const daysSinceStart =
    (lastDate.getTime() - startTime) / (1000 * 60 * 60 * 24);

  const forecast = [30, 60, 90].map((daysForward) => {
    const futureX = daysSinceStart + daysForward;
    let predictedScore = slope * futureX + intercept;
    // Clamp score 0-100
    predictedScore = Math.max(0, Math.min(100, predictedScore));
    return {
      monthsForward: daysForward / 30,
      score: Math.round(predictedScore),
    };
  });

  const trendDirection =
    slope > 0.05 ? "UP" : slope < -0.05 ? "DOWN" : "STABLE";

  return {
    currentScore: history[history.length - 1]?.score || 0,
    trendDirection,
    forecast,
    historyCount: n,
  };
}
