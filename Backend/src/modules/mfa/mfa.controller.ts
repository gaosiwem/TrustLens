import type { Request, Response } from "express";
import {
  generateMFASecret,
  verifyMFAToken,
  enableMFA,
  disableMFA,
} from "./mfa.service.js";

export async function setupMFAController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const email = req.user?.email;

    if (!userId || !email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { secret, qrCode } = await generateMFASecret(userId, email);

    res.json({
      secret,
      qrCode,
      message: "Scan the QR code with your authenticator app",
    });
  } catch (error) {
    console.error("MFA setup error:", error);
    res.status(500).json({ error: "Failed to setup MFA" });
  }
}

export async function verifyMFAController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { token } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    const isValid = await verifyMFAToken(userId, token);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid token" });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error("MFA verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
}

export async function enableMFAController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { token } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!token) {
      return res.status(400).json({ error: "Verification token required" });
    }

    await enableMFA(userId, token);

    res.json({ message: "MFA enabled successfully" });
  } catch (error: any) {
    console.error("MFA enable error:", error);
    res.status(400).json({ error: error.message || "Failed to enable MFA" });
  }
}

export async function disableMFAController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await disableMFA(userId);

    res.json({ message: "MFA disabled successfully" });
  } catch (error) {
    console.error("MFA disable error:", error);
    res.status(500).json({ error: "Failed to disable MFA" });
  }
}
