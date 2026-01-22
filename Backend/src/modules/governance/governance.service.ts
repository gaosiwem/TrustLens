import prisma from "../../lib/prisma.js";

export async function getEscalationQueue() {
  return prisma.escalationCase.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      complaint: {
        include: {
          brand: true,
          user: true,
        },
      },
    },
  });
}

export async function getEnforcementQueue() {
  return prisma.enforcementAction.findMany({
    where: { resolvedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function resolveEscalation(id: string, status: string) {
  return prisma.escalationCase.update({
    where: { id },
    data: { status },
  });
}

export async function getTrustHeatmap() {
  // Basic aggregation for heatmap
  const scores = await prisma.trustScore.findMany({
    distinct: ["entityId"],
    orderBy: { evaluatedAt: "desc" },
  });

  return {
    CRITICAL: scores.filter((s: any) => s.riskLevel === "CRITICAL").length,
    HIGH: scores.filter((s: any) => s.riskLevel === "HIGH").length,
    MEDIUM: scores.filter((s: any) => s.riskLevel === "MEDIUM").length,
    LOW: scores.filter((s: any) => s.riskLevel === "LOW").length,
  };
}
