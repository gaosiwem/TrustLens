import prisma from "../../prismaClient.js";

export async function getAuditLogs(params?: {
  skip?: number;
  take?: number;
  userId?: string;
}) {
  const { skip = 0, take = 20, userId } = params || {};

  return prisma.auditLog.findMany({
    ...(userId && { where: { actorId: userId } }),
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });
}

export async function logAction(params: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || "",
      metadata: params.metadata || {},
    },
  });
}

export async function getAuditStats() {
  const [total, today] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return { total, today };
}
