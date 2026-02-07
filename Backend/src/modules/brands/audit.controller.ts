import { type Request, type Response } from "express";
import { AuditService } from "../../services/analytics/audit.service.js";
import { subDays } from "date-fns";

export async function getBrandAuditController(req: Request, res: Response) {
  try {
    const brandId = req.params.id as string;

    // Default to last 90 days for the "Pulse" dashboard view
    const endDate = new Date();
    const startDate = subDays(endDate, 90);

    const auditData = await AuditService.generateAuditData(
      brandId,
      startDate,
      endDate,
    );

    res.json({ auditData });
  } catch (error: any) {
    console.error("Audit Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
