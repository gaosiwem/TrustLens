import prisma from "../../lib/prisma.js";

export async function getVerificationOverview() {
  const total = await prisma.verifiedRequest.count();

  const byStatus = await prisma.verifiedRequest.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return {
    total,
    byStatus: byStatus.map((s) => ({
      status: s.status,
      count: s._count.status,
    })),
  };
}

export async function getSLAStats(slaHours: number) {
  const overdue = await prisma.verifiedRequest.count({
    where: {
      status: "PENDING",
      createdAt: {
        lt: new Date(Date.now() - slaHours * 60 * 60 * 1000),
      },
    },
  });

  return { overdue };
}

export async function getVerificationRevenue() {
  // Find plans related to verification
  const verificationPlans = await prisma.subscriptionPlan.findMany({
    where: {
      code: { contains: "VERIFIED" },
    },
    select: { id: true, monthlyPrice: true },
  });

  const planIds = verificationPlans.map((p) => p.id);

  const subscriptions = await prisma.brandSubscription.findMany({
    where: {
      planId: { in: planIds },
      status: "ACTIVE",
    },
    include: { plan: true },
  });

  const totalRevenue = subscriptions.reduce(
    (sum, s) => sum + s.plan.monthlyPrice / 100, // Assuming price is in cents
    0,
  );

  return {
    count: subscriptions.length,
    totalRevenue: Math.round(totalRevenue),
  };
}

export async function getFraudSignals() {
  // Find brands with more than 2 rejections
  const rejectedBrands = await prisma.verifiedRequest.groupBy({
    by: ["brandId"],
    where: { status: "REJECTED" },
    _count: { brandId: true },
    having: {
      brandId: {
        _count: {
          gt: 2,
        },
      },
    },
  });

  return rejectedBrands.map((b) => ({
    brandId: b.brandId,
    rejectionCount: b._count.brandId,
  }));
}

export async function getAuditLogs(limit = 50) {
  return prisma.verificationAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
