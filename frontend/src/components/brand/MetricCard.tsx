"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon | React.ElementType;
  gradient: string;
  suffix?: string;
  className?: string;
  trend?: number;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  gradient,
  suffix,
  className,
  trend,
}: MetricCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-500",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br opacity-5 group-hover:opacity-10 transition-opacity rounded-2xl",
          gradient,
        )}
      />
      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "p-3 w-fit rounded-2xl bg-linear-to-br shadow-lg shadow-black/10 transition-transform group-hover:scale-110 duration-500",
              gradient,
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend !== undefined && trend !== 0 && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-micro font-bold",
                isPositive && "bg-success/10 text-success",
                isNegative && "bg-error/10 text-error",
                !isPositive && !isNegative && "bg-muted text-muted-foreground",
              )}
            >
              <TrendIcon className="w-3 h-3" />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-small font-bold text-muted-foreground">{title}</p>
          <p className="text-2xl font-black mt-1 tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix}
          </p>
        </div>
      </div>
    </div>
  );
}
