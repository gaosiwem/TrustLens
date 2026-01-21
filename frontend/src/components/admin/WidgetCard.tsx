"use client";

import React from "react";

interface WidgetCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function WidgetCard({ title, value, icon, trend }: WidgetCardProps) {
  return (
    <div className="p-6 rounded-xl shadow-sm border border-border bg-card hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-muted-foreground">{title}</p>
        {icon && <div className="text-2xl text-primary">{icon}</div>}
      </div>
      <p className="text-3xl font-bold mb-2">{value}</p>
      {trend && (
        <div
          className={`text-xs flex items-center gap-1 ${
            trend.isPositive
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          <span>{trend.isPositive ? "↑" : "↓"}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  );
}
