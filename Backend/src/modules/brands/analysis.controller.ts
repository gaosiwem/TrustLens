import { type Request, type Response } from "express";
import {
  getRootCauseAnalysis,
  getCompetitorVulnerabilities,
} from "./analysis.service.js";
import { prisma } from "../../lib/prisma.js";

export async function getRootCauseController(req: Request, res: Response) {
  try {
    const { id: brandId } = req.params;
    if (!brandId) {
      return res.status(400).json({ error: "Brand ID is required" });
    }

    // BUSINESS Plan Check (Level 2)
    const brand = (await prisma.brand.findUnique({
      where: { id: brandId },
      include: { subscriptions: { include: { plan: true } } },
    })) as any;

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

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
        error: "Root Cause AI is a BUSINESS plan feature.",
        code: "UPGRADE_REQUIRED",
      });
    }

    const insights = await getRootCauseAnalysis(brandId);
    res.json(insights);
  } catch (error: any) {
    console.error("Root Cause Analysis Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getCompetitorAnalysis(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Brand ID is required" });
    }
    // In a real implementation, we should reuse the plan check middleware or function
    const analysis = await getCompetitorVulnerabilities(id);
    res.json(analysis);
  } catch (error) {
    console.error("Error getting competitor analysis:", error);
    res.status(500).json({ error: "Failed to get competitor analysis" });
  }
}
