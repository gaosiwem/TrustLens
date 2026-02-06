"use client";

import { differenceInHours, differenceInMinutes } from "date-fns";
import { Clock, AlertTriangle, CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SLATimerProps {
  deadline: string | null;
  status: "ON_TRACK" | "AT_RISK" | "BREACHED";
  restricted?: boolean;
}

export function SLATimer({ deadline, status, restricted }: SLATimerProps) {
  if (restricted) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed text-xs font-medium w-fit text-muted-foreground bg-muted/50 cursor-not-allowed"
        title="Upgrade to Business Plan to see SLA"
      >
        <Lock className="w-3.5 h-3.5" />
        <span>Upgrade for SLA</span>
      </div>
    );
  }

  if (!deadline) return null;

  const target = new Date(deadline);
  const now = new Date();
  const diffHours = differenceInHours(target, now);
  const diffMinutes = differenceInMinutes(target, now) % 60;

  const isBreached = status === "BREACHED" || target < now;
  const isAtRisk = status === "AT_RISK" || (diffHours < 2 && diffHours >= 0);

  let color = "text-green-600 bg-green-50 border-green-200";
  let icon = CheckCircle;
  let text = `${diffHours}h ${diffMinutes}m remaining`;

  if (isBreached) {
    color = "text-red-600 bg-red-50 border-red-200 animate-pulse";
    icon = AlertTriangle;
    text = `SLA Breached by ${Math.abs(diffHours)}h`;
  } else if (isAtRisk) {
    color = "text-amber-600 bg-amber-50 border-amber-200";
    icon = Clock;
  }

  const Icon = icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold w-fit",
        color,
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{text}</span>
    </div>
  );
}
