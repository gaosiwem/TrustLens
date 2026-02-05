"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Download,
  Search,
  AlertCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import StandardLoader from "../StandardLoader";

interface RiskSignal {
  id: string;
  type: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  momentum: number;
  description: string;
  count: number;
}

export default function RiskSignalsWidget({ brandId }: { brandId: string }) {
  const { data: session } = useSession();
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [phase, setPhase] = useState<"SCANNING" | "RESULTS">("SCANNING");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchSignals() {
      if (!brandId || !session?.accessToken) return;
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await axios.get(
          `${apiUrl}/brands/${brandId}/risk-signals`,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          },
        );
        setSignals(res.data.signals);

        // Simulate premium scanning delay for UX
        setTimeout(() => {
          setPhase("RESULTS");
          setLoading(false);
        }, 2500);
      } catch (err: any) {
        setLoading(false);
        setPhase("RESULTS");
      }
    }
    fetchSignals();
  }, [brandId, session]);

  const handleDownload = async () => {
    if (downloading || !brandId || !session?.accessToken) return;
    setDownloading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const response = await axios.get(
        `${apiUrl}/brands/${brandId}/risk-report`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reputation_Risk_Report_${brandId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  if (phase === "SCANNING") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
            AI Network Scanning
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium max-w-[200px] leading-relaxed">
            Parsing recent interactions for sentiment anomalies and viral threat
            vectors...
          </p>
        </div>
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary animate-[scan_2s_ease-in-out_infinite]"
            style={{ width: "40%" }}
          />
        </div>
        <style jsx>{`
          @keyframes scan {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(200%);
            }
          }
        `}</style>
      </div>
    );
  }

  const criticalCount = signals.filter(
    (s) => s.severity === "CRITICAL" || s.severity === "HIGH",
  ).length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${criticalCount > 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
              Threat Assessment
            </h3>
            <p className="text-[9px] font-bold text-muted-foreground uppercase">
              {criticalCount} Active Alerts
            </p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
        >
          <Download
            className={`w-3.5 h-3.5 ${downloading ? "animate-bounce" : ""}`}
          />
          <span className="text-[10px] font-black uppercase tracking-tight">
            Report
          </span>
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
        {signals.map((signal) => (
          <div
            key={signal.id}
            className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition-colors group"
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    signal.severity === "CRITICAL"
                      ? "bg-rose-500 animate-pulse"
                      : signal.severity === "HIGH"
                        ? "bg-rose-500"
                        : "bg-amber-500"
                  }`}
                />
                <span className="text-[10px] font-black uppercase text-foreground">
                  {signal.title}
                </span>
              </div>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                Momentum: {signal.momentum}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
              {signal.description}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase">
                <Zap className="w-3 h-3" />
                {signal.type}
              </div>
              {signal.count > 0 && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase">
                  <AlertCircle className="w-3 h-3" />
                  {signal.count} Sources
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
        <div className="w-full bg-muted/50 rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black text-foreground uppercase tracking-tight">
              Signal Strength
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-3 h-1.5 rounded-sm ${i <= 4 ? "bg-primary" : "bg-primary/20"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
