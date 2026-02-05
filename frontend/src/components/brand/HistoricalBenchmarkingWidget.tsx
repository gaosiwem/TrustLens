"use client";

import { useEffect, useState } from "react";
import {
  History,
  TrendingUp,
  Award,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import StandardLoader from "../StandardLoader";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface BenchmarkingData {
  current: {
    resolutionRate: number;
    avgSentiment: number;
    avgResponseTime: number;
  };
  peak: {
    resolutionRate: number;
    avgSentiment: number;
    avgResponseTime: number;
    peakDate: string;
  };
  industry: {
    avgResolutionRate: number;
    avgSentiment: number;
    avgResponseTime: number;
    brandCount: number;
  };
  history: {
    month: string;
    resolutionRate: number;
    industryAvg: number;
  }[];
}

export default function HistoricalBenchmarkingWidget({
  brandId,
}: {
  brandId: string;
}) {
  const { data: session } = useSession();
  const [data, setData] = useState<BenchmarkingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBenchmarking() {
      if (!brandId || !session?.accessToken) {
        setLoading(false);
        return;
      }
      try {
        setError(null);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await axios.get(
          `${apiUrl}/brands/${brandId}/analysis/benchmarking`,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          },
        );
        setData(res.data);
      } catch (err: any) {
        console.error("Benchmarking fetch failed:", err);
        if (err.response?.status === 403) {
          setError("This feature requires a BUSINESS or ENTERPRISE plan.");
        } else {
          setError("Unable to load benchmarking data.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchBenchmarking();
  }, [brandId, session]);

  if (loading)
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <StandardLoader />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Analyzing Historical Data...
        </p>
      </div>
    );

  if (error || !data) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 text-center p-6 border-2 border-dashed border-border rounded-3xl">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
          <History className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground mb-1">
            {error ? "Access Restricted" : "Data Unavailable"}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed italic">
            {error ||
              "Insufficient historical data to generate benchmarking averages."}
          </p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Resolution Rate",
      current: data.current.resolutionRate,
      industry: data.industry.avgResolutionRate,
      peak: data.peak.resolutionRate,
      unit: "%",
      better: "higher",
    },
    {
      label: "Sentiment Score",
      current: data.current.avgSentiment * 100,
      industry: data.industry.avgSentiment * 100,
      peak: data.peak.avgSentiment * 100,
      unit: "%",
      better: "higher",
    },
    {
      label: "Response Time",
      current: data.current.avgResponseTime,
      industry: data.industry.avgResponseTime,
      peak: data.peak.avgResponseTime,
      unit: "h",
      better: "lower",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
              Benchmarking
            </h3>
            <p className="text-[9px] font-bold text-muted-foreground uppercase">
              Historical vs Industry
            </p>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase">
          Category Average
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar">
        {/* Comparison Chart */}
        <div className="h-40 relative rounded-2xl bg-muted/20 border border-border p-3 overflow-hidden">
          <div className="absolute top-2 left-3 flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-foreground/50 tracking-tighter">
              12M Resolution Trend
            </span>
          </div>
          <Line
            data={{
              labels: data.history.map((h) => h.month),
              datasets: [
                {
                  label: "Your Brand",
                  data: data.history.map((h) => h.resolutionRate),
                  borderColor: "#1d4ed8",
                  backgroundColor: "rgba(29, 78, 216, 0.1)",
                  tension: 0.4,
                  fill: true,
                  pointRadius: 2,
                  borderWidth: 2,
                },
                {
                  label: "Industry Avg",
                  data: data.history.map((h) => h.industryAvg),
                  borderColor: "rgba(107, 114, 128, 0.3)",
                  borderDash: [5, 5],
                  tension: 0.4,
                  pointRadius: 0,
                  borderWidth: 1.5,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  mode: "index",
                  intersect: false,
                  bodyFont: { size: 10, weight: "bold" },
                  titleFont: { size: 10, weight: "black" },
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: {
                    font: { size: 8, weight: "bold" },
                    color: "#94a3b8",
                  },
                },
                y: {
                  display: false,
                  min: 0,
                  max: 100,
                },
              },
            }}
          />
        </div>

        {metrics.map((m) => {
          const isBetterThanIndustry =
            m.better === "higher"
              ? m.current >= m.industry
              : m.current <= m.industry;

          const diff =
            m.industry > 0 ? ((m.current - m.industry) / m.industry) * 100 : 0;

          return (
            <div key={m.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-foreground/70">
                  {m.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {diff !== 0 && (
                    <span
                      className={`text-[9px] font-bold flex items-center ${isBetterThanIndustry ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {isBetterThanIndustry ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {Math.abs(diff).toFixed(0)}%
                    </span>
                  )}
                  <span className="text-xs font-black text-foreground">
                    {m.current.toFixed(0)}
                    {m.unit}
                  </span>
                </div>
              </div>

              <div className="relative h-4 bg-muted/30 rounded-full overflow-hidden flex items-center px-1">
                {/* Industry Average Marker */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-blue-500/40 z-10"
                  style={{ left: `${Math.min(95, Math.max(5, m.industry))}%` }}
                />

                {/* Current Bar */}
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${isBetterThanIndustry ? "bg-emerald-500" : "bg-rose-500"}`}
                  style={{
                    width: `${
                      m.label === "Response Time"
                        ? Math.min(
                            100,
                            Math.max(5, (m.industry / (m.current || 1)) * 50),
                          )
                        : Math.min(100, Math.max(5, m.current))
                    }%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-tight text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500/40 rounded-full" />
                  Industry Avg
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-2.5 h-2.5 text-amber-500" />
                  Personal Peak: {m.peak.toFixed(0)}
                  {m.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Award className="w-3.5 h-3.5" />
          </div>
          <span className="text-[9px] font-black uppercase text-foreground/80">
            Last Peak: {data.peak.peakDate || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
          <Users className="w-3 h-3" />
          {data.industry.brandCount} Peers
        </div>
      </div>
    </div>
  );
}
