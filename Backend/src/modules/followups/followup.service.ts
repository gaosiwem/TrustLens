import prisma from "../../prismaClient.js";
import { evaluateAuthenticity } from "../responderAuthenticity/authenticity.service.js";
import { evaluateEntityTrust } from "../trust/trust.service.js";
import { processEnforcement } from "../enforcement/enforcement.service.js";

export async function addFollowup(params: {
  complaintId: string;
  userId: string;
  comment: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { role: true },
  });

  // Check complaint status before allowing response
  const complaint = await prisma.complaint.findUnique({
    where: { id: params.complaintId },
    select: { status: true },
  });

  if (!complaint) {
    throw new Error("Complaint not found");
  }

  // Prevent brand users from responding to RESOLVED or REJECTED complaints
  if ((user?.role as any) === "BRAND") {
    if (complaint.status === "RESOLVED" || complaint.status === "REJECTED") {
      throw new Error(
        `Cannot respond to ${complaint.status.toLowerCase()} complaints`,
      );
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const followup = await tx.followup.create({
      data: {
        complaintId: params.complaintId,
        userId: params.userId,
        comment: params.comment,
      },
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

    // If a BRAND user responds, update complaint status to RESPONDED
    if ((user?.role as any) === "BRAND") {
      const complaint = await tx.complaint.findUnique({
        where: { id: params.complaintId },
        select: { status: true },
      });

      if (complaint && complaint.status !== "RESPONDED") {
        await tx.complaint.update({
          where: { id: params.complaintId },
          data: { status: "RESPONDED" },
        });

        await tx.complaintStatusHistory.create({
          data: {
            complaintId: params.complaintId,
            fromStatus: complaint.status,
            toStatus: "RESPONDED",
            changedBy: params.userId,
          },
        });
      }
    }

    // If a CONSUMER responds
    if ((user?.role as any) !== "BRAND") {
      const complaint = await tx.complaint.findUnique({
        where: { id: params.complaintId },
        select: { status: true },
      });

      if (complaint) {
        let nextStatus: string | null = null;
        if (complaint.status === "RESPONDED") {
          nextStatus = "UNDER_REVIEW";
        } else if (complaint.status === "NEEDS_INFO") {
          nextStatus = "INFO_PROVIDED";
        }

        if (nextStatus) {
          await tx.complaint.update({
            where: { id: params.complaintId },
            data: { status: nextStatus as any },
          });

          await tx.complaintStatusHistory.create({
            data: {
              complaintId: params.complaintId,
              fromStatus: complaint.status,
              toStatus: nextStatus as any,
              changedBy: params.userId,
            },
          });
        }
      }
    }

    return followup;
  });

  // Post-transaction analytical side-effects for BRAND responses
  if ((user?.role as any) === "BRAND") {
    try {
      // SPRINT 25: Evaluate Authenticity (Background task-like)
      await evaluateAuthenticity({
        responseId: result.id,
        businessUserId: params.userId,
        comment: params.comment,
      });

      // SPRINT 26: Update Brand Trust & Enforcement
      const brand = await prisma.brand.findFirst({
        where: { managerId: params.userId },
      });
      if (brand) {
        await evaluateEntityTrust("BRAND", brand.id);
        await processEnforcement("BRAND", brand.id);
      }
    } catch (error) {
      console.error("Followup analytics failed (background):", error);
      // We don't rethrow here so the user response is still preserved
    }
  }

  return result;
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
