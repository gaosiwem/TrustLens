"use client";

import { ArrowRight, Check, Loader2, Shield, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { useSubscription } from "../context/SubscriptionContext";
import { useState } from "react";
import { useSession } from "next-auth/react";

export function BrandIntelligenceSection() {
  const { plan: currentPlan } = useSubscription();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (planCode: string) => {
    if (planCode === "FREE") return;

    try {
      setLoading(true);
      const token =
        (session as any)?.accessToken ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        window.location.href = "/auth/login?callbackUrl=/brand/pricing";
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planCode }),
        }
      );

      if (res.ok) {
        const payload = await res.json();

        const form = document.createElement("form");
        form.method = "POST";
        form.action =
          process.env.NEXT_PUBLIC_PAYFAST_URL ||
          "https://sandbox.payfast.co.za/eng/process";

        Object.keys(payload).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = payload[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to initiate checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest">
            <Shield className="h-4 w-4" />
            Brand Governance
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Free to Participate. <br />
            <span className="text-primary italic">Paid to Lead.</span>
          </h2>
          <p className="text-base text-muted-foreground font-medium leading-relaxed">
            Brands never pay to participate or respond on TrustLens. We monetize
            through strategic intelligence, monitoring, and professional
            reputation tools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Free Tier: Participation */}
          <div className="p-10 rounded-3xl border border-border bg-card/50 flex flex-col group hover:border-primary/20 transition-all duration-500">
            <div className="mb-10">
              <div className="inline-flex px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-black tracking-widest mb-6 border border-border">
                Baseline (Free)
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tighter italic">
                Public Participation
              </h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Neutral grounds for every South African brand. Monitor and
                respond without barriers.
              </p>
            </div>

            <div className="space-y-4 mb-10 grow">
              {[
                "Claim brand profile",
                "Unlimited public responses",
                "Basic AI drafting",
                "Standard trust metrics",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground/80 italic">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl font-black text-lg gap-2 border-primary/20 group-hover:bg-primary/5 transition-all"
              disabled
            >
              {currentPlan === "FREE" ? "Current Status" : "Baseline Active"}
            </Button>
          </div>

          {/* Paid Tier: Intelligence */}
          <div className="p-10 rounded-3xl border border-primary/20 bg-primary/5 flex flex-col relative group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -mr-16 -mt-16" />
            <div className="mb-10">
              <div className="inline-flex px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black tracking-widest mb-6 shadow-lg shadow-primary/20">
                Strategic (Subscription)
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tighter italic text-primary">
                Reputation Intelligence
              </h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Advanced monitoring and predictive risk signals for brands who
                value operational excellence.
              </p>
            </div>
            <div className="space-y-4 mb-10 grow">
              {[
                "Real-time monitoring & alerts",
                "AI-driven sentiment analysis",
                "Competitor benchmark reports",
                "Team collaboration & SLAs",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary font-bold" />
                  </div>
                  <span className="text-sm font-bold text-foreground italic">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            <Button
              className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all"
              onClick={() => handleCheckout("BUSINESS")}
              disabled={
                loading ||
                currentPlan === "BUSINESS" ||
                currentPlan === "ENTERPRISE"
              }
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : currentPlan === "BUSINESS" ? (
                "Current Plan"
              ) : (
                <>
                  Unlock Professional Intelligence
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
