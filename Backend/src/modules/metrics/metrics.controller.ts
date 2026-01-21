import type { Request, Response } from "express";
import {
  getSystemMetrics,
  getSystemHealth,
  getUsageStats,
} from "./metrics.service.js";

export async function getMetricsController(req: Request, res: Response) {
  try {
    const metrics = await getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    console.error("Get metrics error:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
}

export async function getHealthController(req: Request, res: Response) {
  try {
    const health = await getSystemHealth();
    res.json(health);
  } catch (error) {
    console.error("Get health error:", error);
    res.status(500).json({ error: "Failed to check health" });
  }
}

export async function getUsageController(req: Request, res: Response) {
  try {
    const usage = await getUsageStats();
    res.json(usage);
  } catch (error) {
    console.error("Get usage error:", error);
    res.status(500).json({ error: "Failed to fetch usage stats" });
  }
}
