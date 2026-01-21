"use client";

import { FC } from "react";
import clsx from "clsx";

type Props = {
  status: string;
};

const StatusBadge: FC<Props> = ({ status }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-200 text-yellow-800";
      case "RESOLVED":
        return "bg-primary/20 text-primary";
      case "IN_REVIEW":
        return "bg-blue-200 text-white";
      case "ESCALATED":
        return "bg-red-200 text-white";
      case "RESPONDED":
        return "bg-primary/20 text-primary";
      case "INFO_PROVIDED":
        return "bg-cyan-200 text-cyan-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <span
      className={clsx(
        "px-2 py-1 rounded-full text-xs font-semibold",
        getStatusStyles(status),
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
