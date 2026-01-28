"use client";

import { PlanCard } from "../../../components/subscription/PlanCard";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { BadgeCheck, Shield } from "lucide-react";
import { REPUTATION_PLANS, VERIFICATION_PLANS } from "../../../config/plans";
import BrandHeader from "../../../components/brand/BrandHeader";

export default function PricingPage() {
  return (
    <>
      <BrandHeader
        title="Pricing & Plans"
        subtitle="Transparent options for authority and intelligence"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
            <Shield className="h-3.5 w-3.5" />
            Pricing Transparency
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Plans built on{" "}
            <span className="text-primary">Trust & Foresight</span>
          </h2>
          <p className="text-muted-foreground font-medium leading-relaxed max-w-xl mx-auto">
            You never pay to respond, defend, or correct information. You pay
            for early signals, competitive insight, and operational excellence.
          </p>
        </div>

        {/* Reputation Intelligence Section (Now First) */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-border grow" />
            <h3 className="text-lg font-bold tracking-tight text-muted-foreground shrink-0 uppercase">
              Intelligence & Monitoring
            </h3>
            <div className="h-px bg-border grow" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {REPUTATION_PLANS.map((p) => (
              <PlanCard key={p.plan} {...p} />
            ))}
          </div>
        </div>

        {/* Verified Badge Section (Now Second) */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-border grow" />
            <div className="flex items-center gap-2 text-primary shrink-0">
              <BadgeCheck className="h-5 w-5" />
              <h3 className="text-lg font-bold tracking-tight uppercase">
                Verified Authority (Annual)
              </h3>
            </div>
            <div className="h-px bg-border grow" />
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 items-start">
            {VERIFICATION_PLANS.map((p) => (
              <PlanCard key={p.plan} {...p} isAnnual />
            ))}
          </div>

          <p className="text-center mt-8 text-xs text-muted-foreground font-medium max-w-xl mx-auto">
            Note: Verified Badge plans require a submitted and approved
            verification request. Verification subscriptions are billed annually
            to maintain your badge status and trust signals.
          </p>
        </div>

        {/* Custom Section */}
        <div className="mt-16 p-8 rounded-3xl bg-muted/30 border border-border text-center relative overflow-hidden mb-8 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3 tracking-tight">
              Need something more custom?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm font-medium">
              We offer volume-based pricing for enterprises with multiple
              registered entities. Let's build a reporting suite tailored to
              your governance structure.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="mailto:sales@trustlens.co.za">
                <Button
                  size="lg"
                  className="rounded-xl font-semibold h-10 px-8"
                >
                  Contact Sales
                </Button>
              </Link>
              <Link href="/brand/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl font-semibold h-10 px-8"
                >
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
