import prisma from "../../lib/prisma.js";

/**
 * Logs a sensitive administrative action.
 */
export async function logAdminAction({
  adminId,
  action,
  entity,
  entityId,
  metadata,
}: {
  adminId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
}) {
  return prisma.adminAuditLog.create({
    data: {
      adminId,
      action,
      entity,
      entityId,
      metadata,
    },
  });
}
