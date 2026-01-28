import type { Request, Response } from "express";
import { logAction } from "../audit/audit.service.js";
import prisma from "../../lib/prisma.js";

export async function trackBadgeClick(req: Request, res: Response) {
  try {
    const { brandId } = req.params;
    const userId = (req as any).user?.userId || "GUEST";

    await logAction({
      userId,
      action: "CLICK_VERIFIED_BADGE",
      entity: "BRAND",
      entityId: brandId ?? "",
      metadata: {
        source: "frontend_badge",
        userAgent: req.headers["user-agent"],
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Track badge click error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
