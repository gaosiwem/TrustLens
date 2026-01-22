import type { Request, Response } from "express";
import { recalcBrandScore } from "./reputation.service.js";
import prisma from "../../lib/prisma.js";

export async function getBrandReputationController(
  req: Request,
  res: Response,
) {
  try {
    const brandId = req.params.brandId as string;

    if (!brandId) {
      return res.status(400).json({ error: "Brand ID required" });
    }

    const reputation = await prisma.reputationScore.findUnique({
      where: { brandId },
      include: { brand: true },
    });

    if (!reputation) {
      return res.status(404).json({ error: "Reputation not found" });
    }

    res.json(reputation);
  } catch (error) {
    console.error("Failed to get reputation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function recalculateBrandReputationController(
  req: Request,
  res: Response,
) {
  try {
    const brandId = req.params.brandId as string;

    if (!brandId) {
      return res.status(400).json({ error: "Brand ID required" });
    }

    await recalcBrandScore(brandId);

    const reputation = await prisma.reputationScore.findUnique({
      where: { brandId },
    });

    res.json(reputation);
  } catch (error) {
    console.error("Failed to recalculate reputation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
