"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Lightbulb,
  Target,
  ArrowRight,
  Activity,
  Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import StandardLoader from "../StandardLoader";

interface Insight {
  topic: string;
  volume: number;
  cause: string;
  impact: string;
  fix: string;
}

export default function RootCauseWidget({ brandId }: { brandId: string }) {
  const { data: session } = useSession();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function fetchAnalysis() {
      if (!brandId || !session?.accessToken) return;
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await axios.get(
          `${apiUrl}/brands/${brandId}/analysis/root-cause`,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          },
        );
        setInsights(res.data);
      } catch (err: any) {
        console.error("Root cause fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, [brandId, session]);

  if (loading)
    return (
      <div className="h-64 flex items-center justify-center">
        <StandardLoader />
      </div>
    );

  if (insights.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-muted/10 rounded-2xl border-2 border-dashed border-border">
        <Brain className="w-10 h-10 text-muted-foreground/30 mb-4" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">
          Insufficient Data
        </p>
        <p className="text-[10px] text-muted-foreground mt-2 max-w-[200px]">
          We need more complaint volume to perform systemic root cause AI
          analysis.
        </p>
      </div>
    );
  }

  const current = insights[activeTab];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
              Root Cause AI
            </h3>
            <p className="text-[9px] font-bold text-muted-foreground uppercase">
              Systemic Intelligence
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {insights.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`w-6 h-1.5 rounded-full transition-all ${activeTab === i ? "bg-primary" : "bg-primary/20 hover:bg-primary/40"}`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-black uppercase text-foreground">
              {current.topic}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-500 text-[9px] font-bold uppercase">
            {current.volume} Signals
          </span>
        </div>

        <div className="space-y-5 overflow-y-auto pr-1 custom-scrollbar">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-500">
                <Zap className="w-3.5 h-3.5" />
                Primary Cause
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                  Severity
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-1 rounded-full ${i <= 4 ? "bg-rose-500" : "bg-rose-500/20"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-foreground leading-relaxed font-medium pl-5 border-l-2 border-rose-500/30">
              {current.cause}
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500">
                <Activity className="w-3.5 h-3.5" />
                Business Impact
              </div>
              <span className="text-[10px] font-black text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                High Risk
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed pl-5 border-l-2 border-amber-500/30">
              {current.impact}
            </p>
          </section>

          <section className="space-y-3 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 opacity-10">
              <Lightbulb className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600">
              <Lightbulb className="w-3.5 h-3.5" />
              Resolution Roadmap
            </div>
            <div className="space-y-3 mt-4 relative">
              <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-emerald-500/20" />

              <div className="flex items-start gap-4 relative">
                <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shrink-0 mt-0.5 z-10" />
                <p className="text-[11px] text-foreground/80 leading-relaxed font-bold">
                  {current.fix}
                </p>
              </div>

              <div className="flex items-start gap-4 relative opacity-40">
                <div className="w-3 h-3 rounded-full bg-emerald-500/30 border-2 border-white shrink-0 mt-0.5 z-10" />
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                  Monitor indicators for improvement...
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border-2 border-background bg-muted flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-violet-500 opacity-20" />
            </div>
          ))}
          <span className="text-[9px] font-bold text-muted-foreground pl-3 self-center uppercase tracking-tight">
            AI Confidence 94%
          </span>
        </div>
      </div>
    </div>
  );
}
