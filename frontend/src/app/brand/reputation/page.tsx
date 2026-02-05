"use client";

import { FeatureGate } from "../../../components/subscription/FeatureGate";
import {
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  History,
  Brain,
  Sword,
} from "lucide-react";
import BrandHeader from "../../../components/brand/BrandHeader";
import { useSession } from "next-auth/react";
import TrustForecastWidget from "../../../components/brand/TrustForecastWidget";
import RiskSignalsWidget from "../../../components/brand/RiskSignalsWidget";
import RootCauseWidget from "../../../components/brand/RootCauseWidget";
import HistoricalBenchmarkingWidget from "../../../components/brand/HistoricalBenchmarkingWidget";
import BrandAuditWidget from "../../../components/brand/BrandAuditWidget";
import { CompetitorScanningWidget } from "../../../components/brand/CompetitorScanningWidget";

export default function ReputationPage() {
  const { data: session } = useSession();
  const brandId = (session?.user as any)?.brandId;
  const widgets = [
    {
      title: "Trust Trend Score",
      description:
        "A calculated forecast of your TrustScore over the next 30 days based on current resolution rates.",
      icon: TrendingUp,
      feature: "trustTrend",
    },
    {
      id: "risk",
      title: "Reputation Risk Signals",
      description:
        "Early warning system that detects negative viral potential in specific complaints.",
      icon: AlertTriangle,
      feature: "riskSignals",
    },
    {
      title: "Historical Benchmarking",
      description:
        "Compare your current performance against your own historical peaks and industry rivals.",
      icon: History,
      feature: "historicalBenchmarking",
    },
    {
      title: "Competitor Vulnerability Scanning",
      description:
        "Offensive intelligence tracking the top weaknesses of your industry rivals.",
      icon: Sword,
      feature: "historicalBenchmarking", // Grouped with benchmarking
    },
    {
      title: "Root Cause AI Analysis",
      description:
        "Systemic diagnosis of topic clusters to identify and resolve recurring process failures.",
      icon: Brain,
      feature: "rootCauseAI",
    },
    {
      title: "Brand Health Audit",
      description:
        "Quarterly summary of your standing in the TrustLens ecosystem.",
      icon: ShieldCheck,
      feature: "brandAudit",
    },
  ];

  return (
    <>
      <BrandHeader
        title="Reputation Intelligence"
        subtitle="Stay ahead of reputation crises with AI-driven insights"
      />

      <div className="p-4 sm:p-8 space-y-8">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest mb-6 uppercase">
            <span className="material-symbols-outlined text-sm">analytics</span>
            Strategic Intelligence
          </div>
          <h2 className="heading-2 font-bold mb-4">
            Monitoring the <span className="text-primary italic">Pulse</span>
          </h2>
          <p className="text-muted-foreground font-medium max-w-2xl text-small">
            Stay informed about your brand's standing in the digital landscape.
            Our reputation suite provides early warning signals and trend
            forecasts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 pb-12">
          {widgets.map((widget) => (
            <div
              key={widget.title}
              className={`${widget.feature === "brandAudit" ? "" : "group"} relative z-10 hover:z-100 transition-all duration-300`}
            >
              <div className="p-6 rounded-3xl bg-card border border-border flex flex-col h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 shadow-sm">
                <div className="flex gap-5 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <widget.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{widget.title}</h3>
                    <p className="text-small text-muted-foreground font-medium leading-relaxed">
                      {widget.description}
                    </p>
                  </div>
                </div>

                <FeatureGate feature={widget.feature}>
                  {widget.feature === "trustTrend" && brandId ? (
                    <TrustForecastWidget brandId={brandId} />
                  ) : widget.feature === "riskSignals" && brandId ? (
                    <RiskSignalsWidget brandId={brandId} />
                  ) : widget.feature === "rootCauseAI" && brandId ? (
                    <RootCauseWidget brandId={brandId} />
                  ) : widget.title === "Competitor Vulnerability Scanning" &&
                    brandId ? (
                    <CompetitorScanningWidget />
                  ) : widget.feature === "historicalBenchmarking" && brandId ? (
                    <HistoricalBenchmarkingWidget brandId={brandId} />
                  ) : widget.feature === "brandAudit" && brandId ? (
                    <BrandAuditWidget brandId={brandId} />
                  ) : (
                    <div className="mt-auto h-32 rounded-xl bg-muted/20 border-2 border-dashed border-border flex flex-col items-center justify-center p-6 text-center bg-linear-to-b from-transparent to-muted/20">
                      <span className="material-symbols-outlined text-primary text-3xl mb-2">
                        schedule
                      </span>
                      <p className="text-[10px] font-black text-foreground/70 uppercase tracking-widest leading-relaxed">
                        Next Audit:{" "}
                        {new Date(
                          new Date().getFullYear(),
                          Math.floor(new Date().getMonth() / 3) * 3 + 3,
                          1,
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Check email for reports
                      </p>
                    </div>
                  )}
                </FeatureGate>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
