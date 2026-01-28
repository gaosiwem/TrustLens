"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { BrandSentimentDailyRow } from "@/types/sentiment";
import { PremiumTooltip, tooltipFormatters } from "./PremiumTooltip";

export function SentimentTrendChart({
  rows,
}: {
  rows: BrandSentimentDailyRow[];
}) {
  const data = rows.map((r) => ({
    day: new Date(r.day).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    avgScore: Number(r.avgScore.toFixed(3)),
    avgUrgency: Number(r.avgUrgency.toFixed(1)),
    avgStars: r.avgStars ? Number(r.avgStars.toFixed(1)) : null,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => (
    <PremiumTooltip
      active={active}
      payload={payload}
      label={label}
      labelFormatter={(l) => l}
      formatter={(value, name) => {
        if (name === "avgScore") {
          const v = Number(value);
          const sign = v >= 0 ? "+" : "";
          return `${sign}${(v * 100).toFixed(0)}%`;
        }
        if (name === "avgStars") {
          return `${Number(value).toFixed(1)} / 5`;
        }
        return `${Math.round(Number(value))}%`;
      }}
    />
  );

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 12, right: 18, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.15}
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            interval="preserveStartEnd"
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            domain={[-1, 1]}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v > 0 ? "+" : ""}${(v * 100).toFixed(0)}%`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            yAxisId="stars"
            orientation="right"
            domain={[0, 5]}
            hide={true}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "16px" }}
            iconType="circle"
            formatter={(value) => {
              if (value === "avgScore") return "Sentiment";
              if (value === "avgUrgency") return "Urgency";
              if (value === "avgStars") return "Star Rating";
              return value;
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgScore"
            name="avgScore"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 6,
              fill: "hsl(var(--primary))",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgUrgency"
            name="avgUrgency"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
            activeDot={{
              r: 5,
              fill: "#f59e0b",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
          />
          <Line
            yAxisId="stars"
            type="monotone"
            dataKey="avgStars"
            name="avgStars"
            stroke="#facc15"
            strokeWidth={3}
            connectNulls={true}
            dot={{
              r: 3,
              fill: "#facc15",
              strokeWidth: 0,
            }}
            activeDot={{
              r: 6,
              fill: "#facc15",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
