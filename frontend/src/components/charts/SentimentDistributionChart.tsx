"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { BrandSentimentDailyRow } from "@/types/sentiment";
import { PremiumTooltip } from "./PremiumTooltip";

export function SentimentDistributionChart({
  rows,
}: {
  rows: BrandSentimentDailyRow[];
}) {
  const last = rows[rows.length - 1];

  const data = [
    {
      name: "Positive",
      value: last?.positivePct ?? 0,
      color: "#10b981",
      description: "Happy customers",
    },
    {
      name: "Neutral",
      value: last?.neutralPct ?? 0,
      color: "#6b7280",
      description: "Mixed feedback",
    },
    {
      name: "Negative",
      value: last?.negativePct ?? 0,
      color: "#ef4444",
      description: "Unhappy customers",
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const item = payload[0];
    const entry = data.find((d) => d.name === item.payload.name);

    return (
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl shadow-black/20 p-4 min-w-[160px]">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry?.color }}
          />
          <span className="text-sm font-bold text-foreground">
            {entry?.name}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-black text-foreground tabular-nums">
            {(item.value * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {entry?.description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 18, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.15}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(19, 182, 236, 0.12)" }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
