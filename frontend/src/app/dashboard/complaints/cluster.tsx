"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ComplaintCluster() {
  const [clusters, setClusters] = useState<any[]>([]);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const res = await axios.get("/api/complaints/clusters");
        setClusters(res.data);
      } catch (err) {
        console.error("Failed to fetch clusters", err);
      }
    };
    fetchClusters();
  }, []);

  if (clusters.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-sm">Trending Clusters</h3>
      {clusters.map((c) => (
        <div
          key={c.id}
          className="p-3 rounded-xl border border-border bg-card text-card-foreground flex justify-between items-center"
        >
          <span className="text-sm font-medium">{c.keyword}</span>
          <span className="text-xs bg-secondary px-2 py-1 rounded-full">
            {c.count} complaints
          </span>
        </div>
      ))}
    </div>
  );
}
