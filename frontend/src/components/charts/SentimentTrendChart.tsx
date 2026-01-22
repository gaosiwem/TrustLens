"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { BrandSentimentDailyRow } from "@/types/sentiment";
import { formatScore } from "@/lib/format";

export function SentimentTrendChart({
  rows,
}: {
  rows: BrandSentimentDailyRow[];
}) {
  const data = rows.map((r) => ({
    day: new Date(r.day).toLocaleDateString(),
    avgScore: Number(r.avgScore.toFixed(3)),
    avgUrgency: Number(r.avgUrgency.toFixed(1)),
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 12, right: 18, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis yAxisId="left" domain={[-1, 1]} tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "12px",
            }}
            formatter={(value: any, name: any) => {
              if (name === "avgScore")
                return [formatScore(value), "Avg Sentiment"];
              return [value, "Avg Urgency"];
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgScore"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgUrgency"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={false}
            opacity={0.6}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
