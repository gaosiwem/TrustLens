"use client";

import { Lock } from "lucide-react";
import { useSubscription, Plan } from "../../context/SubscriptionContext";
import { Button } from "../ui/button";
import Link from "next/link";

interface FeatureGateProps {
  allowed?: Plan[];
  feature?: string;
  children: ReactNode;
}

import { ReactNode } from "react";
import { ALL_PLANS } from "../../config/plans";

export function FeatureGate({ allowed, feature, children }: FeatureGateProps) {
  const { plan: currentPlanCode, features } = useSubscription();

  // 1. Check if specific feature flag is missing
  if (feature && !features[feature]) {
    return <LockedState />;
  }

  // 2. Fallback to plan-based gating if provided
  if (allowed && !allowed.includes(currentPlanCode)) {
    return <LockedState />;
  }

  return <>{children}</>;
}

function LockedState() {
  return (
    <div className="relative rounded-2xl border border-dashed border-border bg-muted/30 p-8 overflow-hidden group">
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-0" />

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-foreground italic">
            Premium Intelligence
          </h4>
          <p className="text-sm text-muted-foreground max-w-[240px]">
            Upgrade your plan to unlock these advanced signals and foresight.
          </p>
        </div>
        <Link href="/brand/pricing">
          <Button size="sm" className="font-bold rounded-xl px-6">
            View Plans
          </Button>
        </Link>
      </div>

      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    </div>
  );
}
