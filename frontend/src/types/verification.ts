export type VerificationStatus =
  | "not_started"
  | "pending_documents"
  | "under_review"
  | "pending"
  | "paid_pending"
  | "approved"
  | "rejected"
  | "expired"
  | "more_info";

export interface VerificationSubscription {
  id: string;
  status: VerificationStatus;
  plan: "monthly" | "annual" | null;
  verifiedUntil: string | null;
  renewalDate: string | null;
}

export interface VerificationDocument {
  id: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  url?: string;
}
