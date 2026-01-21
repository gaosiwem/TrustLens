import type { Request, Response } from "express";
import {
  createComplaint,
  changeComplaintStatus,
  listComplaints,
  getComplaintById,
  searchComplaints,
} from "./complaint.service.js";
import prisma from "../../prismaClient.js";
import logger from "../../config/logger.js";

export async function createComplaintController(req: Request, res: Response) {
  try {
    logger.info("[ComplaintController] Creating complaint. Body:", req.body);

    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    // BRAND users cannot create complaints
    if (req.user.role === "BRAND") {
      return res.status(403).json({
        error: "Brand representatives cannot create new complaints.",
      });
    }

    const complaint = await createComplaint({
      userId: req.user.userId,
      brandName: req.body.brandName || req.body.brand,
      title: req.body.title,
      description: req.body.description,
      attachments: req.files as Express.Multer.File[],
    });

    res.json(complaint);
  } catch (error: any) {
    logger.error("[ComplaintController] Error creating complaint:", error);
    res.status(400).json({ error: error.message });
  }
}

export async function updateStatusController(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const id = req.params["id"];
    if (!id) return res.status(400).json({ error: "Missing ID" });

    await changeComplaintStatus({
      complaintId: id,
      actorId: req.user.userId,
      toStatus: req.body.status,
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
export async function listComplaintsController(req: Request, res: Response) {
  try {
    const user = req.user as any;
    let brandId: string | string[] | undefined = undefined;
    let userId: string | undefined = undefined;

    console.log("[ListComplaints] User data:", {
      userId: user?.userId,
      role: user?.role,
      brandId: user?.brandId,
    });

    if (user?.role === "BRAND") {
      // Find which brands this user manages
      const managedBrands = await prisma.brand.findMany({
        where: { managerId: user.userId } as any,
        select: { id: true, name: true },
      });

      console.log(
        "[ListComplaints] Managed brands for BRAND user:",
        managedBrands
      );

      brandId = managedBrands.map((b) => b.id);

      if (brandId.length === 0) {
        // This brand manager has no linked brands yet? Return empty list.
        console.log(
          "[ListComplaints] No managed brands found, returning empty"
        );
        return res.json({ data: [], nextCursor: null });
      }
    } else {
      // For regular users, only show their own complaints
      userId = user.userId;
    }

    const result = await listComplaints({
      cursor: req.query["cursor"] as string | undefined,
      limit: Number(req.query["limit"] ?? 10),
      status: req.query["status"],
      brandId,
      userId,
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function searchComplaintsController(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string | undefined;
    const brandName = req.query.brandName as string | undefined;
    const query = req.query.q as string | undefined;

    const searchParams = {
      page,
      limit,
      ...(status && { status }),
      ...(brandName && { brandName }),
      ...(query && { query }),
    };

    const result = await searchComplaints(searchParams);

    res.json(result);
  } catch (error: any) {
    console.error("Search complaints error:", error);
    res.status(500).json({ error: "Failed to search complaints" });
  }
}

export async function getComplaintByIdController(req: Request, res: Response) {
  try {
    const id = req.params["id"];
    if (!id) return res.status(400).json({ error: "Missing ID" });

    const complaint = await getComplaintById(id);
    if (!complaint)
      return res.status(404).json({ error: "Complaint not found" });

    // BRAND user restriction
    if (req.user?.role === "BRAND") {
      const isManager = await prisma.brand.findFirst({
        where: {
          id: complaint.brandId,
          managerId: req.user.userId,
        } as any,
      });
      if (!isManager) {
        return res.status(403).json({
          error: "You are not authorized to view this complaint.",
        });
      }
    }

    res.json(complaint);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function publicRecentComplaintsController(
  req: Request,
  res: Response
) {
  try {
    const result = await listComplaints({
      limit: 20,
    });

    const brandsToEnrich = [
      ...new Set(result.data.map((c) => c.brandId)),
    ].filter(Boolean);

    const brandStats = await Promise.all(
      brandsToEnrich.map(async (brandId) => {
        // v = total reviews, R = average stars
        const [totalComplaints, ratingStats] = await Promise.all([
          prisma.complaint.count({ where: { brandId } }),
          prisma.rating.aggregate({
            where: { complaint: { brandId } },
            _avg: { stars: true },
            _count: { stars: true },
          }),
        ]);

        const v = ratingStats._count.stars || 0;
        const R = ratingStats._avg.stars || 0;
        const m = 10;
        const C = 3.5;
        const trustScore = (v * R + m * C) / (v + m);

        return { brandId, trustScore, totalComplaints };
      })
    );

    const enrichedComplaints = result.data.map((complaint) => {
      const stats = brandStats.find((s) => s.brandId === complaint.brandId);
      return {
        ...complaint,
        brand: complaint.brand
          ? {
              ...complaint.brand,
              trustScore: stats?.trustScore || 3.5,
              totalComplaints: stats?.totalComplaints || 0,
            }
          : null,
      };
    });

    res.json(enrichedComplaints);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
