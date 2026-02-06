import prisma from "../../lib/prisma.js";
import { resolveBrand } from "../brands/brand.service.js";
import { assertTransition } from "./complaint.lifecycle.js";
import { logAction as auditLog } from "../audit/audit.service.js";
import { aiQueue } from "../../jobs/ai.processor.js";
import { rewriteComplaint } from "../ai/ai.rewrite.service.js";
import logger from "../../config/logger.js";
import {
  notifyBrand,
  createUserNotification,
} from "../notifications/notification.service.js";
import { getSentimentQueue } from "../../queues/sentiment.queue.js";
import { EmailTemplates } from "../../services/email/emailTemplates.js";
import { EmailOutboxService } from "../../services/emailOutbox.service.js";
import { calculateSLADeadline } from "./sla.helper.js";

export async function createComplaint(input: {
  userId: string;
  brandName: string;
  title: string;
  description: string;
  attachments?: Express.Multer.File[];
}) {
  logger.info("[ComplaintService] Starting createComplaint...");
  const brand = await resolveBrand(input.brandName);
  if (!brand) {
    throw new Error(`Brand "${input.brandName}" not found.`);
  }
  logger.info("[ComplaintService] Brand resolved: %s", (brand as any).id);

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    logger.error("[ComplaintService] User not found: %s", input.userId);
    throw new Error(`User with ID "${input.userId}" not found.`);
  }

  // Calculate SLA Deadline
  const slaDeadline = await calculateSLADeadline((brand as any).id);

  const complaint = await prisma.complaint.create({
    data: {
      userId: input.userId,
      brandId: (brand as any).id,
      title: input.title,
      description: input.description,
      status: "SUBMITTED",
      slaDeadline,
      slaStatus: "ON_TRACK",
    },
  });
  logger.info("[ComplaintService] Complaint record created: %s", complaint.id);

  // Send Brand Invitation if unclaimed and has contact info
  if (!(brand as any).managerId && (brand as any).supportEmail) {
    try {
      logger.info(
        "[ComplaintService] Brand unclaimed. Sending invitation to %s",
        (brand as any).supportEmail,
      );
      const inviteEmail = EmailTemplates.getBrandInvitationEmail(
        input.brandName,
        complaint.id,
      );
      await EmailOutboxService.enqueueEmail({
        toEmail: (brand as any).supportEmail,
        subject: inviteEmail.subject,
        htmlBody: inviteEmail.htmlBody,
        textBody: inviteEmail.textBody,
        brandId: "system",
        attachments: inviteEmail.attachments,
      });
    } catch (err) {
      logger.error("Failed to send brand invitation:", err);
    }
  }

  // Create attachment records
  if (input.attachments && input.attachments.length > 0) {
    logger.info(
      "[ComplaintService] Processing %d attachments...",
      input.attachments.length,
    );
    await Promise.all(
      input.attachments.map((file) =>
        prisma.attachment.create({
          data: {
            complaintId: complaint.id,
            fileName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
          },
        }),
      ),
    );
    logger.info("[ComplaintService] Attachments stored.");
  }

  // Trigger AI rewrite asynchronously
  logger.info("[ComplaintService] Triggering AI tasks...");
  rewriteComplaint(
    input.brandName,
    input.description,
    user?.name || undefined,
    user?.email,
  )
    .then(async (aiSummary) => {
      if (!aiSummary) {
        logger.info(
          "[ComplaintService] AI summary was insufficient or failed, skipping DB update for: %s",
          complaint.id,
        );
        return;
      }
      logger.info(
        "[ComplaintService] AI summary received for: %s",
        complaint.id,
      );
      await prisma.complaint.update({
        where: { id: complaint.id },
        data: { aiSummary },
      });
      logger.info("[ComplaintService] AI summary updated in DB.");
    })
    .catch((err) => logger.error("[ComplaintService] AI rewrite error:", err));

  // Trigger AI analysis queue (sentiment, etc.)
  // We do NOT await this to prevent hanging the request if Redis is down
  aiQueue.add("analyze", { id: complaint.id }).catch((err) => {
    console.error("Failed to add to AI queue (Redis down?):", err.message);
  });

  // Sprint 29: Sentiment Analysis
  const queue = getSentimentQueue();
  if (queue) {
    queue
      .add("complaint-sentiment", {
        brandId: complaint.brandId,
        complaintId: complaint.id,
        sourceType: "COMPLAINT",
        sourceId: complaint.id,
        text: `${complaint.title ?? ""}\n\n${complaint.description ?? ""}`.trim(),
      })
      .catch((err) => {
        logger.error("Failed to add to sentiment queue:", err);
      });
  }

  // SPRINT 28: Notify Brand
  try {
    await notifyBrand({
      brandId: brand.id,
      type: "COMPLAINT_CREATED",
      title: "New Complaint Received",
      body: `A new complaint has been filed against your brand: ${complaint.title}`,
      link: `/brand/complaints/${complaint.id}`,
    });
  } catch (err) {
    logger.error("Failed to notify brand of new complaint:", err);
  }

  console.log("[ComplaintService] Returning response.");
  return complaint;
}

export async function changeComplaintStatus(params: {
  complaintId: string;
  actorId: string;
  toStatus: any;
}) {
  const complaint = await prisma.complaint.findUniqueOrThrow({
    where: { id: params.complaintId },
  });

  assertTransition(complaint.status, params.toStatus);

  const [updatedComplaint] = await prisma.$transaction([
    prisma.complaint.update({
      where: { id: complaint.id },
      data: { status: params.toStatus },
    }),
    prisma.complaintStatusHistory.create({
      data: {
        complaintId: complaint.id,
        fromStatus: complaint.status,
        toStatus: params.toStatus,
        changedBy: params.actorId,
      },
    }),
  ]);

  await auditLog({
    entity: "Complaint",
    entityId: complaint.id,
    action: "STATUS_CHANGED",
    userId: params.actorId,
    metadata: {
      from: complaint.status,
      to: params.toStatus,
    },
  });

  // SPRINT 28: Notify Brand of status change
  try {
    let reviewRating: number | undefined;
    let reviewComment: string | undefined;

    if (params.toStatus === "RESOLVED") {
      const rating = await prisma.rating.findFirst({
        where: { complaintId: updatedComplaint.id },
        orderBy: { createdAt: "desc" },
      });
      if (rating) {
        reviewRating = rating.stars;
        reviewComment = rating.comment || undefined;
      }
    }

    await notifyBrand({
      brandId: updatedComplaint.brandId,
      type: "STATUS_CHANGED",
      title: `Complaint Status: ${params.toStatus}`,
      body: `Status of complaint "${updatedComplaint.title}" changed from ${complaint.status} to ${params.toStatus}`,
      link: `/brand/complaints/${updatedComplaint.id}`,
      ...(reviewRating ? { reviewRating } : {}),
      ...(reviewComment ? { reviewComment } : {}),
    });
  } catch (err) {
    logger.error("Failed to notify brand of status change:", err);
  }

  // SPRINT 28: Notify User of status change
  try {
    await createUserNotification({
      userId: updatedComplaint.userId,
      type: "STATUS_CHANGED",
      title: "Complaint Update",
      body: `Your complaint "${updatedComplaint.title}" status has been updated to ${params.toStatus}`,
      link: `/dashboard/complaints/${updatedComplaint.id}`,
    });
  } catch (err) {
    logger.error("Failed to notify user of status change:", err);
  }

  return updatedComplaint;
}
export async function listComplaints(params: {
  offset?: number | undefined;
  limit: number;
  status?: any | undefined;
  brandId?: string | string[] | undefined;
  userId?: string | undefined;
  search?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
  category?: string | undefined;
  rating?: number | undefined;
}) {
  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.userId) where.userId = params.userId;
  if (params.category) {
    where.brand = {
      ...(where.brand || {}),
      category: { equals: params.category, mode: "insensitive" },
    };
  }
  if (params.rating) {
    where.ratings = {
      some: {
        stars: params.rating,
      },
    };
  }
  if (params.brandId) {
    if (Array.isArray(params.brandId)) {
      where.brandId = { in: params.brandId };
    } else {
      where.brandId = params.brandId;
    }
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      {
        brand: {
          name: { contains: params.search, mode: "insensitive" },
        },
      },
    ];
  }

  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";

  // Handle nested sorting for brand.name
  let orderBy: any = {};
  if (sortBy === "brand.name") {
    orderBy = { brand: { name: sortOrder } };
  } else {
    orderBy = { [sortBy]: sortOrder };
  }

  if (sortBy === "createdAt" || !sortBy) {
    orderBy = { createdAt: sortOrder as "asc" | "desc" };
  }

  const [total, complaints] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.findMany({
      skip: params.offset || 0,
      take: params.limit,
      where,
      orderBy,
      include: {
        brand: {
          include: {
            subscriptions: true,
          },
        },
        attachments: true,
        user: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: {
              select: { complaints: true },
            },
          },
        },
        ratings: true,
        followups: {
          include: {
            user: {
              select: { name: true, role: true },
            },
          },
        },
      },
    }),
  ]);

  return {
    data: complaints,
    total,
  };
}

export async function searchComplaints(params: {
  page: number;
  limit: number;
  status?: string;
  brandName?: string;
  query?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  category?: string;
  rating?: number;
}) {
  const {
    page,
    limit,
    status,
    brandName,
    query,
    sortBy,
    sortOrder,
    category,
    rating,
  } = params;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (rating) {
    where.ratings = {
      some: {
        stars: rating,
      },
    };
  }

  if (category) {
    where.brand = {
      ...(where.brand || {}),
      category: { equals: category, mode: "insensitive" },
    };
  }

  if (brandName) {
    where.brand = {
      ...(where.brand || {}),
      name: { contains: brandName, mode: "insensitive" },
    };
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { aiSummary: { contains: query, mode: "insensitive" } },
    ];
  }

  const orderBy = sortBy
    ? { [sortBy]: sortOrder || "desc" }
    : { createdAt: "desc" as const };

  const [total, complaints] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        brand: {
          include: {
            subscriptions: true,
          },
        },
        attachments: true,
        user: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: {
              select: { complaints: true },
            },
          },
        },
        ratings: true,
        followups: {
          include: {
            user: {
              select: { name: true, role: true },
            },
          },
        },
      },
    }),
  ]);

  return {
    data: complaints,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function addAttachment(params: {
  complaintId: string;
  fileName: string;
  mimeType: string;
  size: number;
}) {
  if (
    !["image/png", "image/jpeg", "application/pdf"].includes(params.mimeType)
  ) {
    throw new Error("Unsupported file type");
  }

  if (params.size > 10 * 1024 * 1024) {
    throw new Error("File too large");
  }

  return prisma.attachment.create({
    data: {
      complaintId: params.complaintId,
      fileName: params.fileName,
      mimeType: params.mimeType,
      size: params.size,
    },
  });
}

export async function getComplaintById(id: string) {
  return prisma.complaint.findUnique({
    where: { id },
    include: {
      brand: {
        include: {
          subscriptions: true,
        },
      },
      attachments: true,
      user: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          _count: {
            select: { complaints: true },
          },
        },
      },
      ratings: true,
      followups: {
        include: {
          user: {
            select: { name: true, role: true },
          },
        },
      },
    },
  });
}
