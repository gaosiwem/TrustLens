import { type Request, type Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { predictTrustTrend } from "./trust.service.js";

// Plan Hierarchy helper
const getPlanLevel = (code: string) => {
  if (["FREE"].includes(code)) return 0;
  if (["PRO", "PREMIUM_VERIFIED"].includes(code)) return 1;
  if (["BUSINESS", "ENTERPRISE", "SCALE"].includes(code)) return 2;
  return 0;
};

export async function getTrustForecastController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const brandId = id;
    const user = (req as any).user;

    if (!brandId) return res.status(400).json({ error: "Missing brand ID" });

    // 1. Authorization
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: { subscriptions: { include: { plan: true } } },
    });

    if (!brand) return res.status(404).json({ error: "Brand not found" });

    // 2. Permission Check (Manager or Admin)
    const canManage =
      user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN" ||
      (user.role === "BRAND" && brand.managerId === user.userId);

    if (!canManage) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to brand data" });
    }

    // 3. Subscription Check (Must be BUSINESS Tier)
    const activeSubs =
      (brand as any).subscriptions?.filter((s: any) => s.status === "ACTIVE") ||
      [];

    const maxPlanLevel = activeSubs.reduce((max: number, sub: any) => {
      const currentLevel = getPlanLevel(sub.plan.code);
      return Math.max(max, currentLevel);
    }, 0); // Default to 0 (FREE)

    if (maxPlanLevel < 2) {
      // Logic: FREE (0) and PRO (1) are blocked.
      return res.status(403).json({
        error: "Trust Trend Score is a BUSINESS plan feature.",
        code: "UPGRADE_REQUIRED",
        requiredPlan: "BUSINESS",
      });
    }

    // 4. Calculate Forecast
    const forecast = await predictTrustTrend("BRAND", brandId);

    if (!forecast) {
      return res.json(null);
    }

    return res.json(forecast);
  } catch (error: any) {
    console.error("Trust Forecast Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
