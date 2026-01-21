import { ComplaintStatus } from "@prisma/client";

const transitions: Record<ComplaintStatus, ComplaintStatus[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["UNDER_REVIEW", "RESPONDED", "REJECTED"],
  UNDER_REVIEW: ["NEEDS_INFO", "RESPONDED", "REJECTED"],
  NEEDS_INFO: ["UNDER_REVIEW", "REJECTED"],
  RESPONDED: ["UNDER_REVIEW", "RESOLVED"],
  RESOLVED: [],
  REJECTED: [],
};

export function assertTransition(from: ComplaintStatus, to: ComplaintStatus) {
  if (!transitions[from].includes(to)) {
    throw new Error(`Invalid status transition from ${from} to ${to}`);
  }
}
