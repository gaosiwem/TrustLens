import type { Request, Response } from "express";
import * as governanceService from "./governance.service.js";

export async function getEscalations(req: Request, res: Response) {
  try {
    const data = await governanceService.getEscalationQueue();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getEnforcements(req: Request, res: Response) {
  try {
    const data = await governanceService.getEnforcementQueue();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function resolveEscalation(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "ID and status are required" });
    }
    const data = await governanceService.resolveEscalation(id, status);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getHeatmap(req: Request, res: Response) {
  try {
    const data = await governanceService.getTrustHeatmap();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
