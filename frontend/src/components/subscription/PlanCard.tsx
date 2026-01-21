"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Plan, useSubscription } from "../../context/SubscriptionContext";
import { cn } from "../../lib/utils";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface PlanCardProps {
  plan: Plan;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  isAnnual?: boolean;
}

const PLAN_THEMES: Record<string, string> = {
  FREE: "border-border",
  PRO: "border-primary/20 shadow-primary/5 shadow-xl",
  BUSINESS:
    "border-primary/40 bg-primary/5 shadow-primary/10 shadow-2xl scale-105 z-10",
  ENTERPRISE: "border-foreground/10 bg-muted/50",
  VERIFIED: "border-blue-500/20 bg-blue-500/5 shadow-blue-500/10 shadow-xl",
  BASIC_VERIFIED:
    "border-emerald-500/20 bg-emerald-500/5 shadow-emerald-500/10 shadow-xl",
  PREMIUM_VERIFIED:
    "border-emerald-500/40 bg-emerald-500/5 shadow-emerald-500/10 shadow-2xl scale-105 z-10",
};

export function PlanCard({
  plan,
  price,
  description,
  features,
  popular,
  isAnnual = false,
}: PlanCardProps) {
  const { plan: currentPlan, loading: contextLoading } = useSubscription();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const isCurrent = currentPlan === plan;

  const handleCheckout = async () => {
    if (plan === "FREE") return;
    if (plan === "ENTERPRISE") {
      window.location.href = "mailto:sales@trustlens.co.za";
      return;
    }

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
          body: JSON.stringify({ planCode: plan }),
        },
      );

      if (res.ok) {
        const payload = await res.json();

        // Create hidden form and submit to PayFast
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
    <div
      className={cn(
        "relative p-8 rounded-[2.5rem] border bg-card flex flex-col transition-all duration-500",
        PLAN_THEMES[plan],
      )}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-black tracking-widest rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-black mb-2 tracking-tighter italic">
          {plan}
        </h3>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-black tracking-tighter">{price}</span>
          {price !== "Custom" && (
            <span className="text-muted-foreground text-sm font-bold">
              /{isAnnual ? "yr" : "mo"}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
          {description}
        </p>
      </div>

      <div className="space-y-4 mb-10 grow">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground/80 leading-tight">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <Button
        onClick={handleCheckout}
        disabled={loading || isCurrent}
        variant={isCurrent ? "outline" : "default"}
        className={cn(
          "w-full h-14 rounded-2xl font-black text-lg transition-all active:scale-95",
          isCurrent &&
            "border-primary/30 text-primary bg-primary/5 hover:bg-muted",
        )}
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isCurrent ? (
          "Current Plan"
        ) : plan === "ENTERPRISE" ? (
          "Contact Sales"
        ) : (
          "Get Started"
        )}
      </Button>

      {process.env.NODE_ENV === "development" &&
        !isCurrent &&
        plan !== "FREE" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                const token =
                  (session as any)?.accessToken ||
                  localStorage.getItem("token") ||
                  sessionStorage.getItem("token");

                if (!token) {
                  console.error("[DEV] No token available");
                  alert("Please log in first");
                  return;
                }

                console.log("[DEV] Activating plan:", plan);

                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/dev-activate`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ planCode: plan }),
                  },
                );

                console.log("[DEV] Response status:", res.status);
                const data = await res.json();
                console.log("[DEV] Response data:", data);

                if (res.ok) {
                  window.location.href = `/brand/subscription/success?plan=${plan}`;
                } else {
                  console.error("[DEV] Failed to activate plan:", data);
                  alert(data.error || "Failed to activate plan");
                }
              } catch (e) {
                console.error("[DEV] Error:", e);
              }
            }}
            className="w-full mt-2 text-xs opacity-50 hover:opacity-100 font-bold italic"
          >
            Simulate Payment (Dev)
          </Button>
        )}
    </div>
  );
}
