"use client";

import { ReactNode } from "react";

interface TooltipPayloadItem {
  name: string;
  value: number | string;
  payload: any;
  color?: string;
  dataKey?: string;
}

interface PremiumTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatter?: (value: any, name: string, item: TooltipPayloadItem) => ReactNode;
  labelFormatter?: (label: string) => ReactNode;
}

export function PremiumTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: PremiumTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl shadow-black/20 p-4 min-w-[180px]">
      {/* Label/Title */}
      {label && (
        <div className="mb-3 pb-2 border-b border-border">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {labelFormatter ? labelFormatter(label) : label}
          </p>
        </div>
      )}

      {/* Values */}
      <div className="space-y-2">
        {payload.map((item, index) => {
          const displayValue = formatter
            ? formatter(item.value, item.name, item)
            : item.value;

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: item.color || "hsl(var(--primary))",
                  }}
                />
                <span className="text-xs font-medium text-muted-foreground capitalize">
                  {formatName(item.name)}
                </span>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatName(name: string): string {
  // Convert camelCase to readable format
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace("Avg ", "")
    .trim();
}

// Preset formatters for common use cases
export const tooltipFormatters = {
  percentage: (value: number) => `${(value * 100).toFixed(0)}%`,
  score: (value: number) =>
    value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2),
  count: (value: number) => value.toLocaleString(),
  urgency: (value: number) => `${Math.round(value)}%`,
};
