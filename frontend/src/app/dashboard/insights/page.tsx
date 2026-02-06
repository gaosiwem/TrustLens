"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import UserHeader from "../../../components/dashboard/UserHeader";
import StandardLoader from "../../../components/StandardLoader";
import { ShieldCheck, Zap, Target, BarChart3, AlertCircle } from "lucide-react";
import BrandLogo from "../../../components/BrandLogo";

interface BrandPerformance {
  brandName: string;
  logoUrl?: string;
  resolutionRate: number;
  totalComplaints: number;
}

interface AIInsightsData {
  topIssue: string;
  resolutionSuggestion: string;
  resolutionRate: number;
  platformResolutionRate: number;
  brandPerformance: BrandPerformance[];
}

export default function AIInsightsPage() {
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const fetchInsights = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const res = await axios.get(`${apiUrl}/dashboard`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      setData(res.data.insights);
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <>
      <UserHeader
        title="AI Insights"
        subtitle="Strategic analysis of your complaint data and brand performance"
      />

      {loading ? (
        <StandardLoader />
      ) : (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          {/* Main AI Narrative Card */}
          <section className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 lg:p-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black tracking-widest">
                  <Zap className="w-4 h-4 fill-primary" />
                  AI Strategy Summary
                </div>

                <h2 className="text-2xl lg:text-3xl font-black italic tracking-tighter leading-tight">
                  {data?.resolutionSuggestion ||
                    "Analyzing your data patterns..."}
                </h2>

                <p className="text-base text-muted-foreground font-medium leading-relaxed italic">
                  {data?.brandPerformance.length === 0 ? (
                    <span>
                      We are waiting for your first complaint data to generate
                      personalized predictions.
                      <br className="mb-2" />
                      <span className="text-foreground not-italic">
                        Did you know?
                      </span>{" "}
                      Verified claims with photos are{" "}
                      <span className="text-primary font-bold">
                        3x more likely
                      </span>{" "}
                      to specific resolutions.
                    </span>
                  ) : (
                    <>
                      Based on your current interactions, your primary focus is
                      on{" "}
                      <span className="text-foreground font-bold underline decoration-primary/30 decoration-2">
                        {data?.topIssue}
                      </span>
                      . Our models predict a resolution likelihood of{" "}
                      <span className="text-foreground font-bold whitespace-nowrap">
                        {data?.resolutionRate}%
                      </span>{" "}
                      across your active portfolio.
                    </>
                  )}
                </p>
              </div>

              <div className="w-full lg:w-72 shrink-0 space-y-4">
                <div className="p-6 rounded-3xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                      Your Success Rate
                    </span>
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-4xl font-black tracking-tighter text-center">
                    {data?.resolutionRate}%
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000"
                      style={{ width: `${data?.resolutionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Benchmark Card */}
            <section className="rounded-3xl bg-card border border-border p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-info/10 text-info">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  Platform Benchmarks
                </h3>
              </div>

              <div className="space-y-8 py-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      Personal Rate
                    </span>
                    <span className="text-xl font-black">
                      {data?.resolutionRate}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000"
                      style={{ width: `${data?.resolutionRate}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Platform Average
                    </span>
                    <span className="text-xl font-black">
                      {data?.platformResolutionRate}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-primary/20">
                    <div
                      className="h-full bg-primary/20 transition-all duration-1000"
                      style={{ width: `${data?.platformResolutionRate}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground italic">
                    * Based on real-time data from 10,000+ active complaints
                    across all sectors.
                  </p>
                </div>
              </div>
            </section>

            {/* Brand Performance Leaderboard */}
            <section className="rounded-3xl bg-card border border-border p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-success/10 text-success">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  Brand Performance
                </h3>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {data?.brandPerformance.map((brand, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex items-center gap-4 group hover:bg-muted/40 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center p-2 shadow-sm shrink-0">
                      <BrandLogo
                        brandName={brand.brandName}
                        brandLogoUrl={brand.logoUrl}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">
                        {brand.brandName}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        {brand.totalComplaints} Interaction History
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-primary">
                        {brand.resolutionRate}%
                      </div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                        Resolve Rate
                      </div>
                    </div>
                  </div>
                ))}

                {!data?.brandPerformance.length && (
                  <div className="py-12 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm font-bold text-muted-foreground italic">
                      File your first complaint to unlock brand performance
                      tracking.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
