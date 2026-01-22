"use client";

import { FeatureGate } from "../../../components/subscription/FeatureGate";
import { BrainCircuit, LineChart, Target, Layers } from "lucide-react";
import BrandHeader from "../../../components/brand/BrandHeader";

export default function InsightsPage() {
  const insights = [
    {
      title: "Complaint Categorisation",
      description:
        "AI-driven breakdown of your complaints by core issue (e.g., Service, Billing, Product).",
      icon: Layers,
      allowed: ["PRO", "BUSINESS", "ENTERPRISE"] as const,
    },
    {
      title: "Root Cause Analysis",
      description:
        "Deep dive into recurring patterns and underlying operational failures.",
      icon: Target,
      allowed: ["BUSINESS", "ENTERPRISE"] as const,
    },
    {
      title: "Sentiment over Time",
      description:
        "Visual mapping of customer emotional intensity across your complaint history.",
      icon: BrainCircuit,
      allowed: ["BUSINESS", "ENTERPRISE"] as const,
    },
    {
      title: "Predictive Risk Score",
      description:
        "Forecasting potential reputation dips based on current volume and tone trends.",
      icon: LineChart,
      allowed: ["ENTERPRISE"] as const,
    },
  ];

  return (
    <>
      <BrandHeader
        title="AI Insights"
        subtitle="Go beyond simple numbers with actionable intelligence"
      />

      <div className="p-4 sm:p-8 space-y-8">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest mb-6 uppercase">
            <span className="material-symbols-outlined text-sm">
              psychology
            </span>
            Cognitive Analysis
          </div>
          <h2 className="heading-2 font-bold mb-4">
            Intelligence <span className="text-primary italic">Engine</span>
          </h2>
          <p className="text-muted-foreground font-medium max-w-2xl text-small">
            TrustLens AI analyzes the nuance of consumer feedback to give you
            actionable intelligence and emotional diagnostics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 pb-12">
          {insights.map((insight) => (
            <div key={insight.title} className="flex flex-col h-full">
              <div className="grow p-6 rounded-3xl bg-card border border-border flex flex-col hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 shadow-sm">
                <div className="grow">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <insight.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{insight.title}</h3>
                  <p className="text-small text-muted-foreground font-medium leading-relaxed mb-6">
                    {insight.description}
                  </p>
                </div>
                <FeatureGate allowed={insight.allowed as any}>
                  <div className="h-40 rounded-xl bg-muted/20 border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 text-center p-6 bg-linear-to-b from-transparent to-muted/10">
                    <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center animate-pulse">
                      <insight.icon className="h-5 w-5 text-muted-foreground opacity-30" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[10px] uppercase tracking-widest text-foreground/80">
                        Generating insight stream...
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Live data will appear here once analysis is complete.
                      </p>
                    </div>
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
