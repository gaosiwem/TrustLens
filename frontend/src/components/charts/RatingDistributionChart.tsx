"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Star } from "lucide-react";

export function RatingDistributionChart({ events }: { events: any[] }) {
  // Aggregate stars from events
  const distribution = [1, 2, 3, 4, 5].map((stars) => {
    const count = events.filter(
      (e) => e.stars === stars || e.rating?.stars === stars,
    ).length;
    return { stars, count };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3 w-3 ${
                    s <= payload[0].payload.stars
                      ? "fill-amber-500 text-amber-500"
                      : "text-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xl font-black tabular-nums">
            {payload[0].value}{" "}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">
              Ratings
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={distribution}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis
            dataKey="stars"
            tick={{
              fontSize: 12,
              fontWeight: 700,
              fill: "hsl(var(--muted-foreground))",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}★`}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(19, 182, 236, 0.12)" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {distribution.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.stars >= 4
                    ? "hsl(var(--success))"
                    : entry.stars === 3
                      ? "hsl(var(--warning))"
                      : "hsl(var(--destructive))"
                }
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
