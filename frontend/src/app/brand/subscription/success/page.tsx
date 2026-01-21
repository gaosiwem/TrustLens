"use client";

import { useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { ALL_PLANS } from "../../../../config/plans";
import { useSubscription } from "../../../../context/SubscriptionContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const planCode = searchParams.get("plan");
  const { refreshSubscription } = useSubscription();

  const plan =
    ALL_PLANS.find((p) => p.plan === planCode) ||
    ALL_PLANS.find((p) => p.plan === "BUSINESS");

  const hasToastShown = useRef(false);

  useEffect(() => {
    refreshSubscription();

    if (!hasToastShown.current && planCode) {
      toast.success(
        `Payment successful! Your ${plan?.plan || planCode} features are now active.`,
      );
      hasToastShown.current = true;
    }
  }, [planCode, plan, refreshSubscription]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center pt-20 pb-20">
      <div className="max-w-xl w-full mx-auto px-4 text-center space-y-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative z-10 mx-auto">
            <Zap className="w-12 h-12 text-primary fill-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter">
            {plan?.plan} <span className="text-primary italic">Unlocked!</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Thank you for your purchase. Your payment has been received! Your{" "}
            {plan?.plan} features and monitoring alerts are now fully active on
            your dashboard.
          </p>
        </div>

        <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl shadow-foreground/5 space-y-4">
          <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase">
            Included in your plan
          </p>
          <ul className="text-left space-y-3 font-medium text-foreground italic">
            {plan?.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/brand/reputation" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-16 rounded-2xl px-10 font-black text-xl border-2 hover:bg-muted"
            >
              Reputation AI
            </Button>
          </Link>
          <Link href="/brand/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full h-16 rounded-2xl px-10 font-black text-xl shadow-2xl shadow-primary/20 flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
