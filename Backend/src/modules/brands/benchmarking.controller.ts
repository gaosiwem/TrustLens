import type { Request, Response } from "express";
import { BenchmarkingService } from "./benchmarking.service.js";
import { prisma } from "../../lib/prisma.js";

export const getBenchmarkingController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id: brandId } = req.params;
    const userId = (req as any).user.id;

    // 1. Feature Gate Check
    const brandWithSub = await prisma.brand.findUnique({
      where: { id: brandId as string },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
        },
      },
    });

    const subscriptions = brandWithSub?.subscriptions || [];
    const hasFeature = subscriptions.some((sub: any) => {
      const planFeatures = sub.plan.features as any;
      return planFeatures?.historicalBenchmarking === true;
    });

    if (!hasFeature) {
      return res.status(403).json({
        error: "Historical Benchmarking is a BUSINESS tier feature.",
      });
    }

    // 2. Fetch Data
    const data = await BenchmarkingService.getBenchmarkingData(
      brandId as string,
    );

    return res.json(data);
  } catch (error: any) {
    console.error("[BenchmarkingController] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
