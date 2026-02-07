"use client";
import { FeatureGate } from "../../../components/subscription/FeatureGate";
import { Switch } from "../../../components/ui/switch";
import { Bell, Zap, TrendingUp, BarChart3 } from "lucide-react";
export default function AlertsPage() {
  const alertTypes = [
    {
      id: "complaints",
      title: "New Complaint Alerts",
      description:
        "Get notified the moment a new review or complaint is logged against your brand.",
      icon: Bell,
      allowed: ["PRO", "BUSINESS", "ENTERPRISE"] as const,
    },
    {
      id: "spikes",
      title: "Volume Spike Alerts",
      description:
        "Immediate warnings if complaint volume exceeds your 7-day rolling average by 200%.",
      icon: Zap,
      allowed: ["PRO", "BUSINESS", "ENTERPRISE"] as const,
    },
    {
      id: "sentiment",
      title: "Sentiment Shift Alerts",
      description:
        "AI-detected drops in customer mood metrics across your latest 10 reviews.",
      icon: TrendingUp,
      allowed: ["BUSINESS", "ENTERPRISE"] as const,
    },
    {
      id: "benchmarks",
      title: "Benchmark Deviation",
      description:
        "Alerts when your TrustScore falls below the industry average for your category.",
      icon: BarChart3,
      allowed: ["BUSINESS", "ENTERPRISE"] as const,
    },
  ];
  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      {" "}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {" "}
        <div className="mb-12">
          {" "}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
            {" "}
            Monitoring &{" "}
            <span className="text-primary italic">Alerts</span>{" "}
          </h1>{" "}
          <p className="text-muted-foreground font-medium">
            {" "}
            Configure how and when you receive critical intelligence about your
            brand's reputation.{" "}
          </p>{" "}
        </div>{" "}
        <div className="space-y-6">
          {" "}
          {alertTypes.map((alert) => (
            <div key={alert.id} className="relative">
              {" "}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 rounded-3xl bg-card border border-border gap-6">
                {" "}
                <div className="flex gap-4">
                  {" "}
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    {" "}
                    <alert.icon className="h-6 w-6 text-primary" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h3 className="font-bold text-foreground mb-1">
                      {" "}
                      {alert.title}{" "}
                    </h3>{" "}
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                      {" "}
                      {alert.description}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="w-full sm:w-auto flex justify-end">
                  {" "}
                  <FeatureGate allowed={alert.allowed as any}>
                    {" "}
                    <div className="flex items-center gap-3">
                      {" "}
                      <span className="text-[10px] font-black tracking-widest text-muted-foreground">
                        {" "}
                        Enabled{" "}
                      </span>{" "}
                      <Switch defaultChecked={alert.id === "complaints"} />{" "}
                    </div>{" "}
                  </FeatureGate>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
