import { type Request, type Response } from "express";
import { prisma } from "../../lib/prisma.js";
import logger from "../../config/logger.js";

export async function getBrandSentimentDailyController(
  req: Request,
  res: Response,
) {
  try {
    const user = (req as any).user;
    let brandId = user.brandId;

    // For BRAND users, look up their managed brand
    if (!brandId && user.role === "BRAND") {
      const managedBrand = await prisma.brand.findFirst({
        where: { managerId: user.userId },
        select: { id: true },
      });
      brandId = managedBrand?.id;
    }

    if (!brandId) {
      return res
        .status(403)
        .json({ error: "No brand associated with this user" });
    }

    const { days: daysParam } = req.query;
    const days = Math.min(Number(daysParam || "30"), 180);
    const since = new Date(Date.now() - days * 86400000);

    const rows = await prisma.brandSentimentDaily.findMany({
      where: { brandId, day: { gte: since } },
      orderBy: { day: "asc" },
    });

    res.json({ rows });
  } catch (error: any) {
    logger.error("Error fetching brand daily sentiment:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function getBrandSentimentEventsController(
  req: Request,
  res: Response,
) {
  try {
    const user = (req as any).user;
    let brandId = user.brandId;

    // For BRAND users, look up their managed brand
    if (!brandId && user.role === "BRAND") {
      const managedBrand = await prisma.brand.findFirst({
        where: { managerId: user.userId },
        select: { id: true },
      });
      brandId = managedBrand?.id;
    }

    if (!brandId) {
      return res
        .status(403)
        .json({ error: "No brand associated with this user" });
    }

    const { take: takeParam } = req.query;
    const take = Math.min(Number(takeParam || "50"), 200);

    const events = await prisma.sentimentEvent.findMany({
      where: { brandId },
      orderBy: { createdAt: "desc" },
      take,
    });

    // Enrich RATING events with stars
    const ratingIds = events
      .filter((e) => e.sourceType === "RATING" && e.sourceId)
      .map((e) => e.sourceId!);

    let ratings: any[] = [];
    if (ratingIds.length > 0) {
      ratings = await prisma.rating.findMany({
        where: { id: { in: ratingIds } },
        select: { id: true, stars: true, comment: true },
      });
    }

    const items = events.map((event) => {
      if (event.sourceType === "RATING") {
        const r = ratings.find((r) => r.id === event.sourceId);
        return { ...event, rating: r || null };
      }
      return event;
    });

    res.json({ items });
  } catch (error: any) {
    logger.error("Error fetching brand sentiment events:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function getComplaintSentimentSnapshotController(
  req: Request,
  res: Response,
) {
  try {
    const user = (req as any).user;
    const brandId = user.brandId;
    const { id: complaintId } = req.params;

    if (!brandId) {
      return res
        .status(403)
        .json({ error: "No brand associated with this user" });
    }

    const snapshot = await prisma.complaintSentimentSnapshot.findFirst({
      where: { complaintId, brandId },
    });

    res.json({ snapshot });
  } catch (error: any) {
    logger.error("Error fetching complaint sentiment snapshot:", error);
    res.status(500).json({ error: error.message });
  }
}
