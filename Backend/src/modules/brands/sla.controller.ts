import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get SLA Config
export const getSLAConfig = async (req: Request, res: Response) => {
  try {
    const { id: brandId } = req.params;

    let config = await prisma.brandSLAConfig.findUnique({
      where: { brandId },
    });

    if (!config) {
      // Return defaults if not set
      config = {
        brandId,
        lowPriorityHours: 48,
        mediumPriorityHours: 24,
        highPriorityHours: 4,
        criticalPriorityHours: 1,
      } as any;
    }

    res.json(config);
  } catch (error) {
    console.error("Error fetching SLA config:", error);
    res.status(500).json({ error: "Failed to fetch SLA config" });
  }
};

// Update SLA Config
export const updateSLAConfig = async (req: Request, res: Response) => {
  try {
    const { id: brandId } = req.params;
    const { low, medium, high, critical } = req.body;

    const config = await prisma.brandSLAConfig.upsert({
      where: { brandId },
      update: {
        lowPriorityHours: low,
        mediumPriorityHours: medium,
        highPriorityHours: high,
        criticalPriorityHours: critical,
      },
      create: {
        brandId,
        lowPriorityHours: low || 48,
        mediumPriorityHours: medium || 24,
        highPriorityHours: high || 4,
        criticalPriorityHours: critical || 1,
      },
    });

    res.json(config);
  } catch (error) {
    console.error("Error updating SLA config:", error);
    res.status(500).json({ error: "Failed to update SLA config" });
  }
};
