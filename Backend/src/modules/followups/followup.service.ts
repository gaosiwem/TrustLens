import prisma from "../../lib/prisma.js";
import { evaluateAuthenticity } from "../responderAuthenticity/authenticity.service.js";
import { evaluateEntityTrust } from "../trust/trust.service.js";
import { processEnforcement } from "../enforcement/enforcement.service.js";
import {
  notifyBrand,
  createUserNotification,
} from "../notifications/notification.service.js";
import { getSentimentQueue } from "../../queues/sentiment.queue.js";
import logger from "../../config/logger.js";

export async function addFollowup(params: {
  complaintId: string;
  userId: string;
  comment: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { role: true },
  });

  const isBrand = (user?.role as any) === "BRAND";

  // 1. Fetch complaint data first (outside transaction)
  const complaint = await prisma.complaint.findUnique({
    where: { id: params.complaintId },
    select: {
      id: true,
      status: true,
      brandId: true,
      userId: true,
      title: true,
    },
  });

  if (!complaint) {
    throw new Error("Complaint not found");
  }

  // 2. Role-based status validation
  if (
    isBrand &&
    (complaint.status === "RESOLVED" || complaint.status === "REJECTED")
  ) {
    throw new Error(
      `Cannot respond to ${complaint.status.toLowerCase()} complaints`,
    );
  }

  // 3. Prepare Logic for Sequential Transaction
  const operations: any[] = [];

  // Operation 1: Create Followup (Always)
  operations.push(
    prisma.followup.create({
      data: {
        complaintId: params.complaintId,
        userId: params.userId,
        comment: params.comment,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    }),
  );

  // Operation 2 & 3: Update Status & History (Conditional)
  let nextStatus: string | null = null;
  if (isBrand) {
    if (complaint.status !== "RESPONDED") {
      nextStatus = "RESPONDED";
    }
  } else {
    if (complaint.status === "RESPONDED") {
      nextStatus = "UNDER_REVIEW";
    } else if (complaint.status === "NEEDS_INFO") {
      nextStatus = "INFO_PROVIDED";
    }
  }

  if (nextStatus) {
    operations.push(
      prisma.complaint.update({
        where: { id: params.complaintId },
        data: { status: nextStatus as any },
      }),
    );

    operations.push(
      prisma.complaintStatusHistory.create({
        data: {
          complaintId: params.complaintId,
          fromStatus: complaint.status,
          toStatus: nextStatus as any,
          changedBy: params.userId,
        },
      }),
    );
  }

  // 4. Execute Transaction
  const results = await prisma.$transaction(operations);
  const followup = results[0]; // First result is always the followup

  // SIDE EFFECTS (Outside transaction)
  const complaintData = complaint;

  // 1. Notifications
  if (!isBrand) {
    // Run in background to prevent blocking response
    notifyBrand({
      brandId: complaintData.brandId,
      type: "NEW_CONSUMER_MESSAGE",
      title: "New Message from Consumer",
      body: `A consumer has sent a new message regarding complaint: ${complaintData.title}`,
      link: `/brand/complaints/${params.complaintId}`,
    }).catch((err) =>
      logger.error("Failed to send followup notification (background):", err),
    );
  } else {
    createUserNotification({
      userId: complaintData.userId,
      type: "BRAND_RESPONSE",
      title: "Brand Responded",
      body: `A brand has responded to your complaint: ${complaintData.title}`,
      link: `/dashboard/complaints/${params.complaintId}`,
    }).catch((err) =>
      logger.error("Failed to create user notification (background):", err),
    );
  }

  // 2. Sentiment Analysis
  try {
    const queue = getSentimentQueue();
    if (queue) {
      queue
        .add("followup-sentiment", {
          brandId: complaintData.brandId,
          complaintId: params.complaintId,
          sourceType: isBrand ? "BRAND_RESPONSE" : "CONSUMER_MESSAGE",
          sourceId: followup.id,
          text: params.comment,
        })
        .catch((err) => logger.error("Sentiment queue add failed:", err));
    }
  } catch (err) {
    logger.error("Failed to access sentiment queue:", err);
  }

  // 3. Analytics (Existing logic)
  if (isBrand) {
    try {
      await evaluateAuthenticity({
        responseId: followup.id,
        businessUserId: params.userId,
        comment: params.comment,
      });

      const brand = await prisma.brand.findFirst({
        where: { managerId: params.userId },
      });
      if (brand) {
        await evaluateEntityTrust("BRAND", brand.id);
        await processEnforcement("BRAND", brand.id);
      }
    } catch (error) {
      logger.error("Followup analytics failed (background):", error);
    }
  }

  return followup;
}

export async function getFollowupsByComplaint(complaintId: string) {
  return prisma.followup.findMany({
    where: { complaintId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

export async function deleteFollowup(id: string, userId: string) {
  // Only allow users to delete their own followups
  const followup = await prisma.followup.findUnique({
    where: { id },
  });

  if (!followup || followup.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return prisma.followup.delete({
    where: { id },
  });
}
