import prisma from "../../prismaClient.js";

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

  if (entityType === "BRAND") {
    // Brand Trust Logic
    // 1. Complaint resolution rate
    // 2. Average sentiment
    // 3. Response SLA
    const [complaintsCount, resolvedCount] = await Promise.all([
      client.complaint.count({ where: { brandId: entityId } }),
      client.complaint.count({
        where: { brandId: entityId, status: "RESOLVED" },
      }),
    ]);

    if (complaintsCount > 0) {
      const resolutionRate = resolvedCount / complaintsCount;
      // Penalty based on resolution rate
      if (resolutionRate < 0.5) score -= 20;
      if (resolutionRate < 0.3) score -= 20;
    }

    // 4. Authenticity check
    const badAuthenticity = await client.responderAuthenticityScore.count({
      where: {
        businessUserId:
          (
            await client.brand.findUnique({
              where: { id: entityId },
              select: { managerId: true },
            })
          )?.managerId || "",
        riskBand: "HIGH",
      },
    });
    score -= badAuthenticity * 5;
  } else {
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
  }

  score = Math.max(0, Math.min(100, score));
  const riskLevel = getRiskLevel(score);

  return client.trustScore.create({
    data: {
      entityType,
      entityId,
      score,
      riskLevel,
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
