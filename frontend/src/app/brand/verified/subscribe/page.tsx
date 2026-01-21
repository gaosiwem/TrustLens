"use client";

import { subscribeToVerification } from "../../../../api/verification.api";
import { Button } from "../../../../components/ui/button";
import { BadgeCheck, Loader2, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

const PLANS = [
  {
    id: "BASIC_VERIFIED",
    name: "Basic Verification",
    price: "R500",
    interval: "yr",
    description:
      "Essential identity verification for SMEs, sole proprietors, and new businesses.",
    features: [
      "Business identity verification",
      "Green verified badge",
      "Annual status re-validation",
      "Standard processing queue",
    ],
  },
  {
    id: "PREMIUM_VERIFIED",
    name: "Premium Verification",
    price: "R1,500",
    interval: "yr",
    description:
      "Advanced authority and governance for established brands. Best for corporate trust.",
    popular: true,
    features: [
      "Everything in Basic",
      "Priority verification queue",
      "Fast-track dispute clarification",
      "Verification audit trail",
      "Extended badge visibility",
    ],
  },
];

export default function VerificationSubscribePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleSubscribe = async (plan: string) => {
    if (!session?.accessToken) {
      window.location.href = `/auth/login?callbackUrl=/brand/verified/subscribe`;
      return;
    }

    try {
      setLoading(plan);
      const payload = await subscribeToVerification(session.accessToken, plan);

      // PayFast Form Submission
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
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate subscription");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest">
            <BadgeCheck className="h-4 w-4" />
            Authority Subscription
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Activate Your{" "}
            <span className="text-primary italic">Verified Identity</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Maintain your verified status and badge visibility with an active
            verification subscription. Choose the plan that fits your brand's
            governance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-10 rounded-[3rem] border bg-card flex flex-col transition-all duration-500 hover:shadow-2xl ${
                plan.popular
                  ? "border-primary/40 bg-primary/5 scale-105 z-10"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-black tracking-widest rounded-full shadow-lg">
                  Best Value
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-2xl font-black mb-2 tracking-tighter italic">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-black tracking-tighter">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm font-bold">
                    /{plan.interval}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-12 grow">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <BadgeCheck className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground/80 italic">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={!!loading}
                className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                {loading === plan.id ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Secure My Badge
                    <Zap className="h-5 w-5 ml-2 fill-primary-foreground" />
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link
            href="/brand/verified"
            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Return to Verification Center
          </Link>
        </div>
      </div>
    </div>
  );
}
