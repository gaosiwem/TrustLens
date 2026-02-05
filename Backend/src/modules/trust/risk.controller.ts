import { type Request, type Response } from "express";
import { getRiskSignals } from "./risk.service.js";
// @ts-ignore
import { generateRiskReportPDF } from "../../services/analytics/risk-report.service.js";
import { prisma } from "../../lib/prisma.js";

export async function getRiskSignalsController(req: Request, res: Response) {
  try {
    const brandId = req.params.id as string;
    if (!brandId)
      return res.status(400).json({ error: "Brand ID is required" });

    // BUSINESS Plan Check (Level 2)
    const brand = (await prisma.brand.findUnique({
      where: { id: brandId },
      include: { subscriptions: { include: { plan: true } } },
    })) as any;

    if (!brand) return res.status(404).json({ error: "Brand not found" });

    const activeSubs = brand.subscriptions.filter(
      (s: any) => s.status === "ACTIVE",
    );

    const planLevels = ["FREE", "PRO", "BUSINESS", "ENTERPRISE", "SCALE"];

    // Find the highest plan level among all active subscriptions
    const maxPlanLevel = activeSubs.reduce((max: number, sub: any) => {
      const currentLevel = planLevels.indexOf(sub.plan.code);
      return Math.max(max, currentLevel);
    }, 0); // Default to 0 (FREE)

    if (maxPlanLevel < 2) {
      return res.status(403).json({
        error: "Reputation Risk Signals is a BUSINESS plan feature.",
        code: "UPGRADE_REQUIRED",
      });
    }

    const signals = await getRiskSignals(brandId);
    res.json({ signals });
  } catch (error: any) {
    console.error("Risk Signals Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function downloadRiskReportController(
  req: Request,
  res: Response,
) {
  try {
    const brandId = req.params.id as string;
    if (!brandId)
      return res.status(400).json({ error: "Brand ID is required" });

    // Plan check repeated for safety
    const brand = (await prisma.brand.findUnique({
      where: { id: brandId },
      include: { subscriptions: { include: { plan: true } } },
    })) as any;

    if (!brand) return res.status(404).json({ error: "Brand not found" });

    const activeSubs = brand.subscriptions.filter(
      (s: any) => s.status === "ACTIVE",
    );

    const hasBusinessAccess = activeSubs.some((sub: any) => {
      return (
        sub.plan.code === "BUSINESS" || (sub.plan.monthlyPrice || 0) >= 149900
      );
    });

    if (!hasBusinessAccess) {
      return res
        .status(403)
        .json({ error: "Upgrade to BUSINESS for PDF reports." });
    }

    const signals = await getRiskSignals(brandId);
    const pdfBuffer = await generateRiskReportPDF(brand, signals);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=TrustLens_Risk_Report_${brandId}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("Risk Report Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
