import type { Request, Response } from "express";
import * as adminService from "./verificationAdmin.service.js";

export async function getOverview(req: Request, res: Response) {
  try {
    const data = await adminService.getVerificationOverview();
    res.json(data);
  } catch (error) {
    console.error("Verification Overview Error:", error);
    res.status(500).json({ error: "Failed to fetch verification overview" });
  }
}

export async function getRevenue(req: Request, res: Response) {
  try {
    const data = await adminService.getVerificationRevenue();
    res.json(data);
  } catch (error) {
    console.error("Verification Revenue Error:", error);
    res.status(500).json({ error: "Failed to fetch verification revenue" });
  }
}

export async function getSLA(req: Request, res: Response) {
  try {
    const hours = Number(req.query.hours) || 48;
    const data = await adminService.getSLAStats(hours);
    res.json(data);
  } catch (error) {
    console.error("Verification SLA Error:", error);
    res.status(500).json({ error: "Failed to fetch verification SLA stats" });
  }
}

export async function getFraud(req: Request, res: Response) {
  try {
    const data = await adminService.getFraudSignals();
    res.json(data);
  } catch (error) {
    console.error("Verification Fraud Error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch verification fraud signals" });
  }
}

export async function getAudits(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit) || 50;
    const data = await adminService.getAuditLogs(limit);
    res.json(data);
  } catch (error) {
    console.error("Verification Audits Error:", error);
    res.status(500).json({ error: "Failed to fetch verification audit logs" });
  }
}
