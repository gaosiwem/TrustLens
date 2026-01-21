"use client";

import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function MetricCard({
  title,
  value,
  icon,
  color = "bg-primary",
  trend,
}: MetricCardProps) {
  return (
    <div
      className={`flex flex-col p-6 rounded-xl shadow-sm border border-border bg-card hover:shadow-md transition`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-muted-foreground">
          {title}
        </span>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {trend && (
        <div
          className={`text-xs mt-2 ${
            trend.isPositive
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last
          period
        </div>
      )}
    </div>
  );
}
