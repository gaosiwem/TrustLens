import type { Request, Response } from "express";
import {
  getBrandAlertPrefs,
  updateBrandAlertPrefs,
} from "../../services/brandAlertPreference.service.js";
import { prisma } from "../../lib/prisma.js";

/**
 * Checks if a user has access to a brand's data.
 */
async function checkBrandAccess(
  userId: string,
  brandId: string,
): Promise<boolean> {
  const membership = await prisma.brandMember.findFirst({
    where: { userId, brandId, isActive: true },
  });
  if (membership) return true;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, managerId: userId },
  });
  return !!brand;
}

export async function getBrandPrefsController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { brandId } = req.params;

    if (!userId || !brandId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const hasAccess = await checkBrandAccess(userId, brandId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const prefs = await getBrandAlertPrefs(brandId);
    res.json(prefs);
  } catch (error) {
    console.error("Get brand prefs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateBrandPrefsController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { brandId } = req.params;
    const data = req.body;

    if (!userId || !brandId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const hasAccess = await checkBrandAccess(userId, brandId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await updateBrandAlertPrefs(brandId, data);
    res.json(updated);
  } catch (error) {
    console.error("Update brand prefs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
