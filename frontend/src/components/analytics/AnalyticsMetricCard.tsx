"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../lib/utils";

interface AnalyticsMetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  delta?: number;
  reverseColor?: boolean; // If true, positive delta is red (e.g. for complaints)
}

export function AnalyticsMetricCard({
  title,
  value,
  description,
  delta,
  reverseColor = false,
}: AnalyticsMetricCardProps) {
  const isPositive = delta !== undefined && delta > 0;
  const isNegative = delta !== undefined && delta < 0;

  const getDeltaColor = () => {
    if (!delta) return "text-muted-foreground";
    const good = reverseColor ? isNegative : isPositive;
    return good ? "text-emerald-500" : "text-destructive";
  };

  const DeltaIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
      <div className="flex justify-between items-start">
        <span className="text-small font-bold text-muted-foreground">
          {title}
        </span>
        {delta !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 text-[10px] font-black tracking-widest uppercase",
              getDeltaColor(),
            )}
          >
            <DeltaIcon className="w-3 h-3" />
            {Math.abs(delta)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-black mt-1 group-hover:text-primary transition-colors tracking-tight">
          {value}
        </h3>
        {description && (
          <p className="text-small text-muted-foreground font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
