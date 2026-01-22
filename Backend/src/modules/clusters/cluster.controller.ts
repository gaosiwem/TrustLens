import type { Request, Response } from "express";
import prisma from "../../lib/prisma.js";

export async function getClustersController(req: Request, res: Response) {
  try {
    const { brandId } = req.query;

    const where = brandId ? { brandId: String(brandId) } : {};

    const clusters = await prisma.complaintCluster.findMany({
      where,
      orderBy: { count: "desc" },
      take: 20,
    });

    res.json(clusters);
  } catch (error) {
    console.error("Failed to get clusters:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
