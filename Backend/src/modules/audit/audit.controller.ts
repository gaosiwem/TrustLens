import type { Request, Response } from "express";
import { getAuditLogs, getAuditStats } from "./audit.service.js";

export async function getAuditController(req: Request, res: Response) {
  try {
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const take = req.query.take ? parseInt(req.query.take as string) : 20;
    const userId = req.query.userId as string | undefined;

    const logs = await getAuditLogs({
      skip,
      take,
      ...(userId && { userId }),
    });
    res.json(logs);
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
}

export async function getAuditStatsController(req: Request, res: Response) {
  try {
    const stats = await getAuditStats();
    res.json(stats);
  } catch (error) {
    console.error("Get audit stats error:", error);
    res.status(500).json({ error: "Failed to fetch audit stats" });
  }
}
