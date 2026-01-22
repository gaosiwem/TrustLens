import prisma from "../../lib/prisma.js";

export type EscalationStatus =
  | "PENDING"
  | "INVESTIGATING"
  | "RESOLVED"
  | "REFERRED";

export async function createEscalation(params: {
  complaintId: string;
  escalatedBy: "USER" | "SYSTEM" | "ADMIN";
  reason: string;
}) {
  // Check if already escalated
  const existing = await prisma.escalationCase.findUnique({
    where: { complaintId: params.complaintId },
  });

  if (existing) return existing;

  // AI assessment (mocked for now, integrating into AI service later)
  const aiRiskSummary = "Automated escalation due to: " + params.reason;

  return prisma.escalationCase.create({
    data: {
      complaintId: params.complaintId,
      escalatedBy: params.escalatedBy,
      reason: params.reason,
      aiRiskSummary,
      status: "PENDING",
    },
  });
}

export async function resolveEscalation(
  id: string,
  adminId: string,
  status: EscalationStatus,
) {
  return prisma.escalationCase.update({
    where: { id },
    data: { status },
  });
}
