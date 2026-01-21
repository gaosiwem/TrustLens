"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const InternalLineChart = dynamic(() => import("./internal/LineChart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center text-muted-foreground">
      Loading chart...
    </div>
  ),
});

export default function ResolutionTrendChart() {
  const { data: session } = useSession();
  const [data, setData] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) return;
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await axios.get(`${apiUrl}/admin/trend/resolutions`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        setData({
          labels: res.data.map((item: any) => item.date),
          values: res.data.map((item: any) => item.count),
        });
      } catch (error) {
        console.error("Failed to fetch resolution trend:", error);
      }
    };

    fetchData();
  }, [session?.accessToken]);

  return (
    <div className="rounded-xl bg-card p-6 border border-border shadow-sm">
      <h2 className="font-semibold text-lg mb-4">Resolutions Over Time</h2>
      {data.labels.length > 0 ? (
        <InternalLineChart
          labels={data.labels}
          data={data.values}
          label="Resolutions"
        />
      ) : (
        <div className="h-64 flex items-center justify-center text-muted-foreground italic">
          No data available for the period
        </div>
      )}
    </div>
  );
}
