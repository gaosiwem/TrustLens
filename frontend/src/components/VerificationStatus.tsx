"use client";

interface VerificationStatusProps {
  status:
    | "PENDING"
    | "VERIFIED"
    | "REJECTED"
    | "NEEDS_INFO"
    | "DRAFT"
    | "UNDER_REVIEW"
    | "RESOLVED";
}

export default function VerificationStatus({
  status,
}: VerificationStatusProps) {
  const statusConfig = {
    PENDING: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-300",
      label: "Pending",
    },
    VERIFIED: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-300",
      label: "Verified",
    },
    REJECTED: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-800 dark:text-red-300",
      label: "Rejected",
    },
    NEEDS_INFO: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-800 dark:text-blue-300",
      label: "Needs Info",
    },
    DRAFT: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-700 dark:text-gray-300",
      label: "Draft",
    },
    UNDER_REVIEW: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-800 dark:text-purple-300",
      label: "Under Review",
    },
    RESOLVED: {
      bg: "bg-teal-100 dark:bg-teal-900/30",
      text: "text-teal-800 dark:text-teal-300",
      label: "Resolved",
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
