import { type Request, type Response } from "express";
import prisma from "../../lib/prisma.js";
import {
  createBrand,
  getBrands,
  getBrandById,
  deleteBrand,
  toggleBrandVerification,
  updateBrand,
  searchBrandsWithRatings,
  getBrandPublicProfile,
} from "./brand.service.js";
import { getLatestTrustScore } from "../trust/trust.service.js";
import crypto from "crypto";

export async function createBrandController(req: Request, res: Response) {
  try {
    const { name, logoUrl } = req.body;
    const file = req.file;
    const user = (req as any).user;
    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    let finalLogoUrl = logoUrl;
    if (file) {
      finalLogoUrl = `/uploads/${file.filename}`;
    }

    const brand = await createBrand(name, isAdmin, finalLogoUrl);
    res.json(brand);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateBrandController(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const {
      name,
      logoUrl,
      supportEmail,
      supportPhone,
      category,
      description,
      websiteUrl,
      isVerified,
    } = req.body;
    const file = req.file;
    const user = (req as any).user;

    if (!id) return res.status(400).json({ error: "Missing brand ID" });

    // Authorization check
    const brandToUpdate = await prisma.brand.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
        },
      },
    });

    if (!brandToUpdate) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const isBrandManager =
      user.role === "BRAND" && (brandToUpdate as any).managerId === user.userId;

    if (!isAdmin && !isBrandManager) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this brand" });
    }

    // PRO Feature Check: Custom Description
    if (
      description !== undefined &&
      description !== (brandToUpdate as any).description
    ) {
      const activeSub = brandToUpdate.subscriptions[0];
      const allowedPlans = [
        "PRO",
        "BUSINESS",
        "ENTERPRISE",
        "PREMIUM_VERIFIED",
      ];

      const hasProAccess =
        activeSub && allowedPlans.includes(activeSub.plan.code);

      if (!hasProAccess && !isAdmin) {
        return res.status(403).json({
          error:
            "Custom brand description is a PRO feature. Please upgrade your plan.",
        });
      }
    }

    let finalLogoUrl = logoUrl;
    if (file) {
      finalLogoUrl = `/uploads/${file.filename}`;
    }

    const updateData: any = {
      name,
      logoUrl: finalLogoUrl,
      websiteUrl,
      supportEmail,
      supportPhone,
      category,
    };

    if (isVerified !== undefined && isAdmin) {
      updateData.isVerified = isVerified === "true" || isVerified === true;
    }

    const brand = await updateBrand(id, updateData);
    res.json(brand);
  } catch (error: any) {
    console.error("Update brand error:", error);
    res.status(400).json({ error: error.message });
  }
}

export async function getBrandsController(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const sortBy = (req.query.sortBy as string) || "name";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "asc";
    const search = req.query.search as string;

    const result = await getBrands({
      limit,
      offset,
      sortBy,
      sortOrder,
      search,
    });
    res.json(result);
  } catch (error) {
    console.error("Get brands error:", error);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
}

export async function deleteBrandController(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ error: "Missing brand ID" });
    await deleteBrand(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete brand" });
  }
}

export async function toggleBrandVerificationController(
  req: Request,
  res: Response,
) {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ error: "Missing brand ID" });
    const brand = await toggleBrandVerification(id);
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle verification" });
  }
}

export async function searchBrandsController(req: Request, res: Response) {
  try {
    const query = req.query.q as string;
    if (!query) return res.json([]);

    const results = await searchBrandsWithRatings(query);
    res.json(results);
  } catch (error) {
    console.error("Search brands error:", error);
    res.status(500).json({ error: "Failed to search brands" });
  }
}

export async function getPublicBrandProfileController(
  req: Request,
  res: Response,
) {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ error: "Missing brand ID" });

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const stars = req.query.stars
      ? (req.query.stars as string)
          .split(",")
          .map((s) => parseInt(s))
          .filter((s) => !isNaN(s))
      : undefined;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;
    const replied =
      req.query.replied === "true"
        ? true
        : req.query.replied === "false"
          ? false
          : undefined;
    const verified = req.query.verified === "true";

    const profile = await getBrandPublicProfile({
      id,
      page,
      limit,
      stars,
      search,
      sortBy,
      replied,
      verified,
    });
    if (!profile) return res.status(404).json({ error: "Brand not found" });
    res.json(profile);
  } catch (error) {
    console.error("Get public brand profile error:", error);
    res.status(500).json({ error: "Failed to fetch brand profile" });
  }
}
export async function getBrandTrustScoreController(
  req: Request,
  res: Response,
) {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ error: "Brand ID is required" });
    const score = await getLatestTrustScore("BRAND", id);
    if (!score) return res.status(404).json({ error: "Trust score not found" });
    res.json(score);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trust score" });
  }
}

export async function getBrandEnforcementsController(
  req: Request,
  res: Response,
) {
  try {
    const id = req.params.id as string;
    const enforcements = await prisma.enforcementAction.findMany({
      where: { entityType: "BRAND", entityId: id, resolvedAt: null },
      orderBy: { createdAt: "desc" },
    });
    res.json(enforcements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch enforcements" });
  }
}

export async function getBrandByIdController(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ error: "Missing brand ID" });

    const brand = await getBrandById(id);
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    // Authorization check
    const user = (req as any).user;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    // Check if user is the manager
    const isBrandManager =
      user.role === "BRAND" && (brand as any).managerId === user.userId;

    if (!isAdmin && !isBrandManager) {
      return res.status(403).json({
        error: "You are not authorized to view this brand's settings",
      });
    }

    // Proactively resolve widgetPlan based on active subscriptions for the UI
    const planCodes = brand.subscriptions.map((s: any) => s.plan.code);
    const widgetPlans = ["ENTERPRISE", "BUSINESS", "PRO"];
    const highestPlan = widgetPlans.find((wp) =>
      planCodes.some((pc) => pc.includes(wp)),
    );

    if (highestPlan) {
      (brand as any).widgetPlan = highestPlan;
    }

    res.json(brand);
  } catch (error) {
    console.error("Get brand error:", error);
    res.status(500).json({ error: "Failed to fetch brand" });
  }
}

export async function updateBrandWidgetSettingsController(
  req: Request,
  res: Response,
) {
  try {
    const id = req.params.id as string;
    const {
      allowedDomains,
      widgetWatermark,
      widgetRoutingEnabled,
      defaultTheme,
      widgetStyles,
      widgetWatermarkText, // Add new field
    } = req.body;

    if (!id) return res.status(400).json({ error: "Missing brand ID" });

    // Auth check
    const user = (req as any).user;
    const brand = await prisma.brand.findUnique({ where: { id } });

    if (!brand) return res.status(404).json({ error: "Brand not found" });

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const isManager =
      user.role === "BRAND" && (brand as any).managerId === user.userId;

    if (!isAdmin && !isManager) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update
    const updated = await prisma.brand.update({
      where: { id },
      data: {
        allowedDomains,
        widgetWatermark,
        widgetRoutingEnabled,
        defaultTheme,
        widgetStyles,
        widgetWatermarkText, // Add to update data
      },
      select: {
        id: true,
        allowedDomains: true,
        managerId: true,
        widgetPlan: true,
        slug: true,
        widgetStyles: true,
        widgetWatermark: true,
        widgetWatermarkText: true, // Add to response
        widgetRoutingEnabled: true,
        defaultTheme: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update widget settings error:", error);
    res.status(500).json({ error: "Failed to update widget settings" });
  }
}

// Generate a new widget key
export async function createBrandWidgetKeyController(
  req: Request,
  res: Response,
) {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId;

    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    // Check ownership
    const isAdmin =
      (req as any).user.role === "ADMIN" ||
      (req as any).user.role === "SUPER_ADMIN";
    const isManager = (req as any).user.userId === brand.managerId;

    if (!isAdmin && !isManager) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Limit active keys
    const count = await prisma.widgetKey.count({
      where: { brandId: id, isActive: true },
    });
    if (count >= 5) {
      return res
        .status(400)
        .json({ error: "Maximum of 5 active keys allowed" });
    }

    const key = `pk_${crypto.randomBytes(24).toString("hex")}`;

    const newKey = await prisma.widgetKey.create({
      data: {
        brandId: id,
        key: key,
        isActive: true,
      },
    });

    res.json({ ok: true, key: newKey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate key" });
  }
}
