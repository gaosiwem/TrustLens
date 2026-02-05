import type { Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { notifyBrand } from "../notifications/notification.service.js";

/**
 * Creates a brand verification request.
 */
export async function requestVerification(req: any, res: Response) {
  try {
    let brandId = req.user.brandId;
    const userId = req.user.userId;
    const { type } = req.body;
    const file = req.file;

    // Fallback: If no brandId in token (stale session), try to find managed brand
    if (!brandId && req.user.role === "BRAND") {
      const managedBrand = await prisma.brand.findFirst({
        where: { managerId: userId },
        select: { id: true },
      });
      if (managedBrand) {
        brandId = managedBrand.id;
        console.log(`[Verification] Recovered brandId from DB: ${brandId}`);
      }
    }

    console.log("[Verification] Request received:", {
      brandId,
      userId,
      body: req.body,
      file: req.file
        ? {
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "MISSING",
    });

    if (!brandId) {
      console.warn("[Verification] Missing brand context");
      return res.status(400).json({ error: "Brand context required." });
    }
    if (!type || !file) {
      console.warn("[Verification] Missing type or file", {
        type,
        file: !!file,
      });
      return res
        .status(400)
        .json({ error: "Document type and file are required." });
    }

    // Find existing request to append to or create new
    const existingRequest = await prisma.verifiedRequest.findFirst({
      where: { brandId, status: "PENDING" },
    });

    const docEntry = {
      type,
      path: `/uploads/${file.filename}`,
      originalName: file.originalname,
      uploadedAt: new Date().toISOString(),
    };

    let request;
    if (existingRequest) {
      const currentDocs = (existingRequest.documents as any[]) || [];
      // Filter out old docs of same type to avoid duplicates
      const updatedDocs = [
        ...currentDocs.filter((d: any) => d.type !== type),
        docEntry,
      ];

      request = await prisma.verifiedRequest.update({
        where: { id: existingRequest.id },
        data: { documents: updatedDocs },
      });
    } else {
      // Get brand name for companyName placeholder
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        select: { name: true },
      });

      request = await prisma.verifiedRequest.create({
        data: {
          brandId,
          userId,
          companyName: brand?.name || "Pending Confirmation",
          documents: [docEntry],
          status: "PENDING",
        },
      });
    }

    res.json(request);
  } catch (error) {
    console.error("Request verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Gets pending verification requests for admin.
 */
export async function getPendingRequests(req: Request, res: Response) {
  try {
    const requests = await prisma.verifiedRequest.findMany({
      where: { status: "PENDING" },
      include: {
        brand: {
          select: {
            name: true,
            subscriptions: {
              include: {
                plan: true,
              },
            },
          },
        },
        user: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedRequests = requests.map((req: any) => ({
      ...req,
      brand: req.brand
        ? {
            ...req.brand,
            subscription: req.brand.subscriptions?.[0] || null,
          }
        : null,
    }));

    res.json(mappedRequests);
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Processes a verification request (approve/reject).
 */
export async function processRequest(req: Request, res: Response) {
  try {
    const { id, action, comment } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action." });
    }

    const status = action === "approve" ? "APPROVED" : "REJECTED";

    const request = await prisma.verifiedRequest.update({
      where: { id },
      data: {
        status,
        adminComments: comment,
      },
    });

    // If approved, toggle brand flag
    await prisma.brand.update({
      where: { id: request.brandId },
      data: { isVerified: status === "APPROVED" },
    });

    // Notify Brand
    try {
      await notifyBrand({
        brandId: request.brandId,
        type: "SYSTEM_UPDATE",
        title: `Verification Request ${status === "APPROVED" ? "Approved" : "Rejected"}`,
        body: `Your verification request has been ${status.toLowerCase()}. ${comment ? `\n\nAdmin Comment: "${comment}"` : ""}`,
        link: "/brand/settings",
      });
    } catch (err) {
      console.error("Failed to send verification notification:", err);
    }

    res.json(request);
  } catch (error) {
    console.error("Process request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Gets the current verification status for a brand.
 */
export async function getBrandVerificationStatus(req: any, res: Response) {
  try {
    let brandId = req.user.brandId;

    if (!brandId && req.user.role === "BRAND") {
      const managedBrand = await prisma.brand.findFirst({
        where: { managerId: req.user.userId },
        select: { id: true },
      });
      brandId = managedBrand?.id;
    }

    if (!brandId)
      return res.status(400).json({ error: "Brand context required." });

    const request = await prisma.verifiedRequest.findFirst({
      where: { brandId },
      include: {
        verifiedSubscription: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also check for active BrandSubscription of type Verified
    const activeSub = await prisma.brandSubscription.findFirst({
      where: {
        brandId,
        status: "ACTIVE",
        plan: { code: { contains: "VERIFIED" } },
      },
      include: { plan: true },
    });

    if (!request) {
      return res.json({
        status: activeSub ? "paid_pending" : "not_started",
        plan: activeSub?.plan.code || null,
        verifiedUntil: activeSub?.endsAt || null,
      });
    }

    const subscription = request.verifiedSubscription[0];
    let status = request.status.toLowerCase();

    // If request is pending but we have an active subscription, show as paid_pending
    if (status === "pending" && activeSub) {
      status = "paid_pending";
    }

    res.json({
      status,
      verifiedUntil: subscription?.endDate || activeSub?.endsAt,
      renewalDate: subscription?.endDate || activeSub?.endsAt,
      plan: activeSub?.plan.code || "monthly",
    });
  } catch (error) {
    console.error("Get brand verification status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * Gets documents for the current brand.
 */
export async function getDocuments(req: any, res: Response) {
  try {
    let brandId = req.user.brandId;

    if (!brandId && req.user.role === "BRAND") {
      const managedBrand = await prisma.brand.findFirst({
        where: { managerId: req.user.userId },
        select: { id: true },
      });
      brandId = managedBrand?.id;
    }

    if (!brandId)
      return res.status(400).json({ error: "Brand context required." });

    const request = await prisma.verifiedRequest.findFirst({
      where: { brandId },
      orderBy: { createdAt: "desc" },
    });

    if (!request) return res.json([]);

    // Transform JSON documents into structured list if needed
    // Assuming request.documents is an array of strings or objects
    const docs = ((request.documents as any[]) || []).map((d, i) => ({
      id: `${request.id}-${i}`,
      type: typeof d === "string" ? d : d.type,
      url:
        typeof d === "string"
          ? null
          : `${process.env.API_URL || "http://localhost:4000"}${d.path}`,
      status:
        request.status === "APPROVED"
          ? "approved"
          : request.status === "REJECTED"
            ? "rejected"
            : "pending",
    }));

    res.json(docs);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Gets verification impact analytics for a brand.
 */
export async function getVerificationAnalytics(req: any, res: Response) {
  try {
    if (!req.user || !req.user.brandId) {
      return res.status(400).json({ error: "Brand context required." });
    }
    const brandId = req.user.brandId;

    // 1. Find the date the brand was first approved for verification
    const verificationRequest = await prisma.verifiedRequest.findFirst({
      where: { brandId, status: "APPROVED" },
      orderBy: { updatedAt: "asc" },
    });

    // If never verified, we can't show "before/after" comparison properly
    // But we'll use a fallback to show current metrics (from the beginning of time)
    // using new Date() caused all 'gte' queries to return 0.
    const vDate = verificationRequest?.updatedAt || new Date(0);

    // 2. Fetch metrics before and after
    const [
      complaintsBefore,
      complaintsAfter,
      ratingsBefore,
      ratingsAfter,
      followupsAfter,
      followupsBefore,
      escalationsBefore,
      escalationsAfter,
      totalViews,
    ] = await Promise.all([
      // Complaints
      prisma.complaint.count({ where: { brandId, createdAt: { lt: vDate } } }),
      prisma.complaint.count({ where: { brandId, createdAt: { gte: vDate } } }),
      // Ratings (for Trust Score)
      prisma.rating.aggregate({
        where: { complaint: { brandId, createdAt: { lt: vDate } } },
        _avg: { stars: true },
      }),
      prisma.rating.aggregate({
        where: { complaint: { brandId, createdAt: { gte: vDate } } },
        _avg: { stars: true },
      }),
      // Response Time (Complaints with brand followups)
      prisma.complaint.findMany({
        where: {
          brandId,
          createdAt: { gte: vDate },
          followups: { some: { user: { role: "BRAND" } } },
        },
        include: {
          followups: {
            where: { user: { role: "BRAND" } },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      }),
      prisma.complaint.findMany({
        where: {
          brandId,
          createdAt: { lt: vDate },
          followups: { some: { user: { role: "BRAND" } } },
        },
        include: {
          followups: {
            where: { user: { role: "BRAND" } },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      }),
      // Escalations
      prisma.escalationCase.count({
        where: { complaint: { brandId, createdAt: { lt: vDate } } },
      }),
      prisma.escalationCase.count({
        where: { complaint: { brandId, createdAt: { gte: vDate } } },
      }),
      // Mock views count based on complaints simply for now
      prisma.complaint.count({ where: { brandId } }),
    ]);

    // Calculate Average Response Time in hours
    const calcAvgResponseTime = (complaints: any[]) => {
      if (!complaints || complaints.length === 0) return 0;
      const totalHours = complaints.reduce((acc, c) => {
        const firstResponse = c.followups?.[0];
        if (!firstResponse) return acc;
        const diff =
          new Date(firstResponse.createdAt).getTime() -
          new Date(c.createdAt).getTime();
        return acc + diff / (1000 * 60 * 60);
      }, 0);
      return Math.round(totalHours / complaints.length);
    };

    const avgResponseTimeBefore = calcAvgResponseTime(followupsBefore);
    const avgResponseTimeAfter = calcAvgResponseTime(followupsAfter);

    // Calculate Escalation Rates
    const escalationRateBefore =
      complaintsBefore > 0
        ? Math.round((escalationsBefore / complaintsBefore) * 100)
        : 0;
    const escalationRateAfter =
      complaintsAfter > 0
        ? Math.round((escalationsAfter / complaintsAfter) * 100)
        : 0;

    // Visibility data (Real Data from AuditLogs)
    // We count VIEW_PROFILE and CLICK_VERIFIED_BADGE for this brand
    const [profileViews, verifiedBadgeClicks] = await Promise.all([
      prisma.auditLog.count({
        where: {
          action: "VIEW_PROFILE",
          entity: "BRAND",
          entityId: brandId,
          createdAt: { gte: vDate }, // Count since verification? Or all time? Let's use all time for now or match requested range.
          // The requested mock logic used totalViews (all time) so we'll stick to that but we can filter by date if needed.
          // Actually, let's just count all views for simplicity as "Profile Views" usually implies total.
        },
      }),
      prisma.auditLog.count({
        where: {
          action: "CLICK_VERIFIED_BADGE",
          entity: "BRAND",
          entityId: brandId,
        },
      }),
    ]);

    const stats = {
      trustScoreBefore: ratingsBefore._avg.stars || 0,
      trustScoreAfter: ratingsAfter._avg.stars || 0,
      complaintsBefore,
      complaintsAfter,
      avgResponseTimeBefore: avgResponseTimeBefore || 0,
      avgResponseTimeAfter: avgResponseTimeAfter || 0,
      profileViews,
      verifiedBadgeClicks,
      escalationRateBefore,
      escalationRateAfter,
      verificationDate: vDate,
    };

    res.json(stats);
  } catch (error: any) {
    console.error("Get verification analytics error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
