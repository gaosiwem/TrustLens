"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function TopicBarChart({ topics }: { topics: string[] }) {
  const counts = new Map<string, number>();
  for (const t of topics) counts.set(t, (counts.get(t) ?? 0) + 1);

  const data = [...counts.entries()]
    .map(([topic, count]) => ({
      topic: topic.charAt(0).toUpperCase() + topic.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const item = payload[0];
    const percentage = ((item.value / topics.length) * 100).toFixed(1);

    return (
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl shadow-black/20 p-4 min-w-[180px]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-sm font-bold text-foreground capitalize">
            {item.payload.topic}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Mentions</span>
            <span className="text-lg font-black text-foreground tabular-nums">
              {item.value}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Share</span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {percentage}%
            </span>
          </div>
          <div className="pt-1">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(item.value / maxCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[240px] w-full">
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
            dataKey="topic"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={60}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(19, 182, 236, 0.12)" }}
          />
          <Bar
            dataKey="count"
            fill="hsl(var(--primary))"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
