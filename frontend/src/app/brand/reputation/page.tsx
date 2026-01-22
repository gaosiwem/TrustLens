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
            <div key={widget.title} className="group relative">
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
                  <div className="mt-auto h-32 rounded-xl bg-muted/20 border-2 border-dashed border-border flex flex-col items-center justify-center p-6 text-center bg-linear-to-b from-transparent to-muted/20">
                    <span className="material-symbols-outlined text-primary/30 text-3xl mb-2">
                      query_stats
                    </span>
                    <p className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">
                      Processing historical signals...
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
