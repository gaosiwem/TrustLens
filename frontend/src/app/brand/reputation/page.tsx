"use client";

import { FeatureGate } from "../../../components/subscription/FeatureGate";
import { ShieldCheck, AlertTriangle, TrendingUp, History } from "lucide-react";
import BrandHeader from "../../../components/brand/BrandHeader";

export default function ReputationPage() {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest mb-6 uppercase">
            <span className="material-symbols-outlined text-sm">analytics</span>
            Strategic Intelligence
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4 leading-tight italic">
            Monitoring the <span className="text-primary">Pulse</span>
          </h2>
          <p className="text-muted-foreground font-medium max-w-2xl text-lg italic">
            Stay informed about your brand's standing in the digital landscape.
            Our reputation suite provides early warning signals and trend
            forecasts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 pb-12">
          {widgets.map((widget) => (
            <div key={widget.title} className="group relative">
              <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col h-full hover:border-primary/20 transition-all duration-500 shadow-sm">
                <div className="flex gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <widget.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic tracking-tighter mb-2">
                      {widget.title}
                    </h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                      {widget.description}
                    </p>
                  </div>
                </div>

                <FeatureGate feature={widget.feature}>
                  <div className="mt-auto h-48 rounded-2xl bg-muted/20 border-2 border-dashed border-border flex flex-col items-center justify-center p-8 text-center bg-linear-to-b from-transparent to-muted/20">
                    <span className="material-symbols-outlined text-primary/30 text-4xl mb-4">
                      query_stats
                    </span>
                    <p className="text-sm font-black text-foreground/70 italic">
                      Aggregating historical signals...
                    </p>
                  </div>
                </FeatureGate>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
