"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function StatsCards() {
  const { data: session } = useSession();
  const [stats, setStats] = useState([
    { label: "Total Complaints", value: "0" },
    { label: "Resolved", value: "0" },
    { label: "Pending", value: "0" },
    { label: "Avg Resolution Time", value: "N/A" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.accessToken) return;
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await axios.get(`${apiUrl}/admin/stats`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const data = res.data;

        setStats([
          {
            label: "Total Complaints",
            value: data.totalComplaints.toLocaleString(),
          },
          { label: "Resolved", value: data.resolved.toLocaleString() },
          { label: "Pending", value: data.open.toLocaleString() },
          {
            label: "Avg Resolution Time",
            value: data.avgResolutionHours
              ? `${data.avgResolutionHours}h`
              : "N/A",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      }
    };

    fetchStats();
  }, [session?.accessToken]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl bg-card p-6 border border-border shadow-sm"
        >
          <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
          <p className="text-3xl font-bold mt-2">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
