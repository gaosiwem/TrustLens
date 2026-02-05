import { type Request, type Response } from "express";
import prisma from "../../lib/prisma.js";

// Helper to normalize host
function normalizeHost(raw: string) {
  try {
    const url = raw.startsWith("http")
      ? new URL(raw)
      : new URL(`https://${raw}`);
    return url.hostname.toLowerCase(); // Use hostname instead of host (ignores port)
  } catch {
    return "";
  }
}

export async function validateWidgetController(req: Request, res: Response) {
  try {
    const { brandSlug, widgetKey, referer, origin } = req.body;
    console.log("DEBUG: Validate Widget:", {
      brandSlug,
      widgetKey,
      referer,
      origin,
    });

    if (!brandSlug)
      return res.status(400).json({ ok: false, reason: "missing_brand" });

    // Find brand by slug
    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug },
      include: { widgetKeys: true, locations: true },
    });

    if (!brand) {
      return res.status(404).json({ ok: false, reason: "brand_not_found" });
    }

    if (!brand.widgetRoutingEnabled) {
      return res.status(403).json({ ok: false, reason: "widgets_disabled" });
    }

    const ref = origin || referer || "";
    const host = normalizeHost(ref);
    // Robust local check: hostname is localhost OR 127.0.0.1 OR raw string contains localhost
    const isDev =
      host === "localhost" || host === "127.0.0.1" || ref.includes("localhost");

    // Key Validation (Business/Enterprise)
    // We allow Dev/Localhost to bypass the key check for previewing purposes
    const requiresKey =
      (brand.widgetPlan === "BUSINESS" || brand.widgetPlan === "ENTERPRISE") &&
      !isDev;

    if (requiresKey) {
      if (!widgetKey)
        return res.status(403).json({ ok: false, reason: "missing_key" });

      const keyRow = brand.widgetKeys.find(
        (k) => k.key === widgetKey && k.isActive,
      );
      if (!keyRow)
        return res.status(403).json({ ok: false, reason: "invalid_key" });

      // Async usage update
      prisma.widgetKey
        .update({
          where: { id: keyRow.id },
          data: { lastUsedAt: new Date() },
        })
        .catch(console.error);
    }

    // Domain Validation (Pro+)
    if (brand.widgetPlan !== "FREE") {
      // host is already calculated above
      const ref = origin || referer || "";
      const host = normalizeHost(ref);

      if (!host) {
        // Strict check: must have referer, unless in dev/test (or undefined local)
        // In local Windows dev, NODE_ENV might be undefined.
        const isProduction = process.env.NODE_ENV === "production";
        if (!isProduction) {
          // Allow in dev/local
        } else {
          return res.status(403).json({ ok: false, reason: "missing_referer" });
        }
      }

      const allowed = (brand.allowedDomains || [])
        .map((d) => normalizeHost(d))
        .filter(Boolean);

      const isProduction = process.env.NODE_ENV === "production";

      const isAllowed =
        !isProduction || // Allow EVERYTHING in dev/local (including empty referer)
        allowed.some((a) => a === host) ||
        host === "localhost" ||
        host === "trustlens.co";

      if (!isAllowed) {
        return res
          .status(403)
          .json({ ok: false, reason: "domain_not_allowed" });
      }
    }

    // Success response
    return res.json({
      ok: true,
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        widgetPlan: brand.widgetPlan,
        widgetWatermark: brand.widgetWatermark,
        locations: brand.locations,
        widgetStyles: brand.widgetStyles,
        widgetWatermarkText: brand.widgetWatermarkText, // Add custom text
      },
      isPremium:
        brand.widgetPlan === "BUSINESS" || brand.widgetPlan === "ENTERPRISE",
      showWatermark: brand.widgetPlan === "FREE" ? true : brand.widgetWatermark,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, reason: "internal_error" });
  }
}

export async function getWidgetResolutionsController(
  req: Request,
  res: Response,
) {
  try {
    const { brandId, limit = "6" } = req.query;
    if (!brandId) return res.status(400).json({ error: "Missing brandId" });

    const items = await prisma.complaint.findMany({
      where: {
        brandId: brandId as string,
        status: "RESOLVED",
      },
      orderBy: { updatedAt: "desc" },
      take: 50, // Fetch more to find the best ratings
      select: {
        id: true,
        title: true,
        description: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            name: true,
          },
        },
        ratings: {
          select: {
            userId: true,
            stars: true,
          },
        },
      },
    });

    const allResolved = items.map((i) => {
      const ownerRating = i.ratings.find((r) => r.userId === i.userId);
      return {
        id: i.id,
        category: null,
        title: i.title,
        description: i.description,
        resolvedAt: i.updatedAt,
        timeToResolveMinutes: 0,
        outcomeTag: "Resolved",
        customerName: i.user?.name || "Verified Customer",
        stars: ownerRating?.stars || 0,
      };
    });

    // Strictly filter for 5-star ratings only
    const fiveStarItems = allResolved.filter((item) => item.stars === 5);

    // Sort by most recent first (using resolvedAt/updatedAt)
    fiveStarItems.sort(
      (a, b) =>
        new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime(),
    );

    // Only return top 6
    const topItems = fiveStarItems.slice(0, 6);

    res.json({
      ok: true,
      items: topItems,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resolutions" });
  }
}

export async function getWidgetMetricsController(req: Request, res: Response) {
  try {
    const { brandId, location } = req.query;
    if (!brandId) return res.status(400).json({ error: "Missing brandId" });

    // Logic to get location ID based on slug if needed, but for now assuming brandId is UUID.
    // If location is provided (slug), resolve it.
    let locationId = null;
    if (location && location !== "all") {
      const loc = await prisma.brandLocation.findFirst({
        where: { brandId: brandId as string, slug: location as string },
      });
      if (loc) locationId = loc.id;
    }

    const today = new Date();
    const start = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 30);

    const latest = await prisma.brandDailyMetrics.findFirst({
      where: { brandId: brandId as string, locationId },
      orderBy: { date: "desc" },
    });

    const trend = await prisma.brandDailyMetrics.findMany({
      where: { brandId: brandId as string, locationId, date: { gte: start } },
      orderBy: { date: "asc" },
      select: { date: true, complaintsOpened: true, complaintsResolved: true },
    });

    res.json({
      ok: true,
      kpis: latest
        ? {
            trustScore: latest.trustScore,
            responseRatePct: latest.responseRatePct,
            medianFirstResponseMinutes: latest.medianFirstResponseMinutes,
            medianResolutionMinutes: latest.medianResolutionMinutes,
            sentimentDelta30d: latest.sentimentDelta30d,
          }
        : null,
      trend,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
}
