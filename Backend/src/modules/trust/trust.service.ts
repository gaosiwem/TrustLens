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
        subscription: { include: { plan: true } },
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
      if (brand.subscription?.plan?.code?.includes("PREMIUM")) {
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
        plan: brand.subscription?.plan?.name || "Free",
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
