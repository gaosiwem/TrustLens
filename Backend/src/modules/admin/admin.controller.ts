import type { Request, Response } from "express";
import {
  getPlatformStats,
  getSubmissionTrend,
  getResolutionTrend,
  getStatusBreakdown,
  getAdminComplaintList,
} from "./admin.service.js";

export async function platformStatsController(req: Request, res: Response) {
  try {
    const stats = await getPlatformStats();
    res.json(stats);
  } catch (error) {
    console.error("Platform stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function submissionTrendController(req: Request, res: Response) {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const trend = await getSubmissionTrend(days);
    res.json(trend);
  } catch (error) {
    console.error("Submission trend error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function resolutionTrendController(req: Request, res: Response) {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const trend = await getResolutionTrend(days);
    res.json(trend);
  } catch (error) {
    console.error("Resolution trend error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function statusBreakdownController(req: Request, res: Response) {
  try {
    const breakdown = await getStatusBreakdown();
    res.json(breakdown);
  } catch (error) {
    console.error("Status breakdown error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function adminComplaintsController(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";
    const status = req.query.status as string;
    const search = req.query.search as string;

    const result = await getAdminComplaintList({
      limit,
      offset,
      sortBy,
      sortOrder,
      status,
      search,
    });
    res.json(result);
  } catch (error) {
    console.error("Admin complaints error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
