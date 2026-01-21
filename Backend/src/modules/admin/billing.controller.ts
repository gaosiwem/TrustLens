import type { Request, Response } from "express";
import prisma from "../../prismaClient.js";
import { logAdminAction } from "./audit.service.js";

/**
 * Gets a high-level revenue summary for the admin dashboard.
 */
export async function getRevenueSummary(req: any, res: Response) {
  try {
    const data = await prisma.invoice.aggregate({
      _sum: {
        subtotal: true,
        vatAmount: true,
        total: true,
      },
      where: { status: "PAID" },
    });

    const summary = {
      revenueExclVAT: data._sum.subtotal ?? 0,
      vatCollected: data._sum.vatAmount ?? 0,
      revenueInclVAT: data._sum.total ?? 0,
    };

    await logAdminAction({
      adminId: req.user.userId,
      action: "READ_REVENUE_SUMMARY",
      entity: "Invoice",
      metadata: summary,
    });

    res.json(summary);
  } catch (error) {
    console.error("Error fetching revenue summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Gets monthly revenue data for charting.
 */
export async function getMonthlyRevenue(req: any, res: Response) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { status: "PAID" },
      orderBy: { issuedAt: "asc" },
    });

    const grouped = invoices.reduce((acc: Record<string, number>, inv: any) => {
      const monthYear = `${inv.issuedAt.getFullYear()}-${String(
        inv.issuedAt.getMonth() + 1
      ).padStart(2, "0")}`;
      acc[monthYear] = (acc[monthYear] || 0) + inv.total;
      return acc;
    }, {} as Record<string, number>);

    await logAdminAction({
      adminId: req.user.userId,
      action: "READ_MONTHLY_REVENUE",
      entity: "Invoice",
    });

    res.json(grouped);
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Gets billing history for a specific brand.
 */
export async function getBrandInvoices(req: any, res: Response) {
  try {
    const { brandId } = req.params;

    const invoices = await prisma.invoice.findMany({
      where: { brandId },
      orderBy: { issuedAt: "desc" },
    });

    await logAdminAction({
      adminId: req.user.userId,
      action: "READ_BRAND_INVOICES",
      entity: "Brand",
      entityId: brandId,
    });

    res.json(invoices);
  } catch (error) {
    console.error("Error fetching brand invoices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
