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
import { formatPct } from "@/lib/format";

export function SentimentDistributionChart({
  rows,
}: {
  rows: BrandSentimentDailyRow[];
}) {
  const last = rows[rows.length - 1];

  const data = [
    { name: "Positive", value: last?.positivePct ?? 0, color: "#10b981" }, // emerald-500
    { name: "Neutral", value: last?.neutralPct ?? 0, color: "#f59e0b" }, // amber-500
    { name: "Negative", value: last?.negativePct ?? 0, color: "#ef4444" }, // red-500
  ];

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 18, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "12px",
            }}
            formatter={(v: any) => formatPct(v)}
          />
          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
