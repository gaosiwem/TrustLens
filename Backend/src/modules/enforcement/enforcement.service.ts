import prisma from "../../lib/prisma.js";
import { getLatestTrustScore } from "../trust/trust.service.js";

export type EnforcementType =
  | "WARNING"
  | "RATE_LIMIT"
  | "REVIEW_REQUIRED"
  | "TEMP_RESTRICTION";

export function getEnforcementType(score: number): EnforcementType | null {
  if (score >= 80) return null;
  if (score >= 60) return "WARNING";
  if (score >= 40) return "RATE_LIMIT";
  if (score >= 20) return "REVIEW_REQUIRED";
  return "TEMP_RESTRICTION";
}

export async function processEnforcement(
  entityType: "USER" | "BRAND",
  entityId: string,
  tx?: any,
) {
  const client = tx || prisma;
  const latestScore = await getLatestTrustScore(entityType, entityId, client);
  if (!latestScore) return;

  const actionType = getEnforcementType(latestScore.score);

  // Check if enforcement already exists
  const existing = await client.enforcementAction.findFirst({
    where: { entityType, entityId, resolvedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!actionType) {
    if (existing) {
      // Resolve previous enforcement if score improved
      await prisma.enforcementAction.update({
        where: { id: existing.id },
        data: { resolvedAt: new Date() },
      });
    }
    return;
  }

  if (existing && existing.actionType === actionType) return; // Already enforced correctly

  // Apply new enforcement
  return prisma.enforcementAction.create({
    data: {
      entityType,
      entityId,
      actionType,
      reason: `Automated enforcement due to trust score: ${latestScore.score} (${latestScore.riskLevel})`,
      triggeredBy: "SYSTEM_GOVERNANCE_ENGINE",
    },
  });
}
