import type { Request, Response } from "express";
import prisma from "../../prismaClient.js";

/**
 * Gets the billing profile for the authenticated brand.
 */
export async function getBillingProfile(req: any, res: Response) {
  try {
    const brandId = req.user.brandId;
    if (!brandId)
      return res.status(400).json({ error: "Brand context required." });

    const profile = await prisma.brandBillingProfile.findUnique({
      where: { brandId },
    });

    res.json(profile || {});
  } catch (error) {
    console.error("Get billing profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Updates the billing profile for the authenticated brand.
 */
export async function updateBillingProfile(req: any, res: Response) {
  try {
    const brandId = req.user.brandId;
    if (!brandId)
      return res.status(400).json({ error: "Brand context required." });

    const {
      legalName,
      registrationNo,
      vatNumber,
      billingEmail,
      addressLine1,
      addressLine2,
      city,
      province,
      postalCode,
      country,
    } = req.body;

    // Basic validation
    if (
      !legalName ||
      !billingEmail ||
      !addressLine1 ||
      !city ||
      !province ||
      !postalCode
    ) {
      return res
        .status(400)
        .json({ error: "Required billing fields are missing." });
    }

    const profile = await prisma.brandBillingProfile.upsert({
      where: { brandId },
      update: {
        legalName,
        registrationNo,
        vatNumber,
        billingEmail,
        addressLine1,
        addressLine2,
        city,
        province,
        postalCode,
        country,
      },
      create: {
        brandId,
        legalName,
        registrationNo,
        vatNumber,
        billingEmail,
        addressLine1,
        addressLine2,
        city,
        province,
        postalCode,
        country,
      },
    });

    res.json(profile);
  } catch (error) {
    console.error("Update billing profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
