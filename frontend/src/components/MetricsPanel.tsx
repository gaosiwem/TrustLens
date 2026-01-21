"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface MetricsPanelProps {
  data?: {
    resolutionRate: number;
    complaintsByStatus: { [key: string]: number };
    trustScore: number;
  };
}

export function MetricsPanel({ data }: MetricsPanelProps) {
  // Default mock data if none provided
  const metrics = data || {
    resolutionRate: 0.82,
    complaintsByStatus: { Pending: 12, Resolved: 34, Rewritten: 5 },
    trustScore: 4.5,
  };

  const chartData = Object.entries(metrics.complaintsByStatus).map(
    ([status, count]) => ({
      status,
      count,
    })
  );

  return (
    <div className="p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-sm">
      <h3 className="font-bold text-lg sm:text-xl mb-6">Platform Metrics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-muted rounded-xl">
          <p className="text-xs text-muted-foreground font-bold mb-1">
            Resolution Rate
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {(metrics.resolutionRate * 100).toFixed(0)}%
          </p>
        </div>
        <div className="p-4 bg-muted rounded-xl">
          <p className="text-xs text-muted-foreground font-bold mb-1">
            Trust Score
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {metrics.trustScore.toFixed(1)}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-xl">
          <p className="text-xs text-muted-foreground font-bold mb-1">
            Total Cases
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {Object.values(metrics.complaintsByStatus).reduce(
              (a, b) => a + b,
              0
            )}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
          Complaints by Status
        </h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="#13b6ec" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MetricsPanel;
