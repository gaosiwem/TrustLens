import type { Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import {
  addFollowup,
  getFollowupsByComplaint,
  deleteFollowup,
} from "./followup.service.js";

export async function addFollowupController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { complaintId, comment } = req.body;

    if (!complaintId || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Role-based verification
    if (req.user?.role === "BRAND") {
      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
        select: { brandId: true },
      });

      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      const managedBrand = await prisma.brand.findFirst({
        where: {
          id: complaint.brandId,
          managerId: userId,
        } as any,
      });

      if (!managedBrand) {
        return res.status(403).json({
          error:
            "You are not authorized to respond to this brand's complaints.",
        });
      }
    }

    const followup = await addFollowup({
      complaintId,
      userId,
      comment,
    });

    res.json(followup);
  } catch (error) {
    console.error("Add followup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getFollowupsController(req: Request, res: Response) {
  try {
    const { complaintId } = req.params;

    if (!complaintId) {
      return res.status(400).json({ error: "Complaint ID required" });
    }

    const followups = await getFollowupsByComplaint(complaintId);
    res.json(followups);
  } catch (error) {
    console.error("Get followups error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteFollowupController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Followup ID required" });
    }

    await deleteFollowup(id, userId);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete followup error:", error);
    if (error.message === "Unauthorized") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}
