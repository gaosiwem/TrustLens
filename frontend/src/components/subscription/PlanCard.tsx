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
  const { activePlans, loading: contextLoading } = useSubscription();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  // Disable if already subscribed to this plan, OR if trying to select FREE while having other plans
  const isCurrent = activePlans.includes(plan);
  const isDisabled = isCurrent || (plan === "FREE" && activePlans.length > 0);

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
        "relative p-6 rounded-2xl border bg-card flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        PLAN_THEMES[plan],
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest rounded-full shadow-md uppercase">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-1 tracking-tight text-foreground">
          {plan}
        </h3>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-3xl font-bold tracking-tight">{price}</span>
          {price !== "Custom" && (
            <span className="text-muted-foreground text-xs font-medium">
              /{isAnnual ? "yr" : "mo"}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          {description}
        </p>
      </div>

      <div className="space-y-3 mb-8 grow">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-2.5">
            <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Check className="h-2.5 w-2.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground/80 leading-snug">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <Button
        onClick={handleCheckout}
        disabled={loading || isDisabled}
        variant={isDisabled ? "outline" : "default"}
        className={cn(
          "w-full h-10 rounded-lg font-semibold text-sm transition-all shadow-sm",
          isDisabled &&
            "border-primary/20 text-primary bg-primary/5 hover:bg-muted",
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCurrent ? (
          "Current Plan"
        ) : plan === "FREE" && activePlans.length > 0 ? (
          "Cancel to Downgrade"
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
            className="w-full mt-2 text-[10px] opacity-40 hover:opacity-100 font-medium h-6"
          >
            Simulate Payment (Dev)
          </Button>
        )}
    </div>
  );
}
