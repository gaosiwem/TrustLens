import prisma from "../lib/prisma.js";
import type { Request } from "express";

export async function createAuditLog(params: {
  req: Request;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: any;
}) {
  try {
    const { req, action, targetType, targetId, metadata } = params;

    await prisma.auditLog.create({
      data: {
        actorId: req.user?.userId || "anonymous",
        action,
        entity: targetType,
        entityId: targetId || "",
        metadata: metadata || {},
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error);
    // Don't throw - audit failure shouldn't block operations
  }
}

export function auditMiddleware(action: string, targetType: string) {
  return async (req: Request, res: any, next: any) => {
    // Log before the action
    await createAuditLog({
      req,
      action,
      targetType,
      ...(req.params.id && { targetId: req.params.id }),
    });

    next();
  };
}
