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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
            <Shield className="h-4 w-4" />
            Pricing Transparency
          </div>
          <h2 className="text-4xl font-black tracking-tight leading-tight italic">
            Plans built on{" "}
            <span className="text-primary">Trust & Foresight</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium italic">
            You never pay to respond, defend, or correct information. You pay
            for early signals, competitive insight, and operational excellence.
          </p>
        </div>

        {/* Verified Badge Section (Now First) */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px bg-border grow" />
            <div className="flex items-center gap-2 text-primary shrink-0">
              <BadgeCheck className="h-6 w-6" />
              <h3 className="text-2xl font-black italic tracking-tighter uppercase">
                Verified Authority (Annual)
              </h3>
            </div>
            <div className="h-px bg-border grow" />
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
            {VERIFICATION_PLANS.map((p) => (
              <PlanCard key={p.plan} {...p} isAnnual />
            ))}
          </div>

          <p className="text-center mt-10 text-sm text-muted-foreground font-medium max-w-2xl mx-auto italic">
            Note: Verified Badge plans require a submitted and approved
            verification request. Verification subscriptions are billed annually
            to maintain your badge status and trust signals.
          </p>
        </div>

        {/* Reputation Intelligence Section (Now Second) */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px bg-border grow" />
            <h3 className="text-2xl font-black italic tracking-tighter text-muted-foreground shrink-0 uppercase">
              Intelligence & Monitoring
            </h3>
            <div className="h-px bg-border grow" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {REPUTATION_PLANS.map((p) => (
              <PlanCard key={p.plan} {...p} />
            ))}
          </div>
        </div>

        {/* Custom Section */}
        <div className="mt-20 p-12 rounded-[4rem] bg-muted/30 border border-border text-center relative overflow-hidden mb-12 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-6 italic tracking-tight">
              Need something more custom?
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto font-medium italic">
              We offer volume-based pricing for enterprises with multiple
              registered entities. Let's build a reporting suite tailored to
              your governance structure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="mailto:sales@trustlens.co.za">
                <Button size="lg" className="rounded-2xl font-black h-16 px-10">
                  Contact Sales
                </Button>
              </Link>
              <Link href="/brand/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl font-bold h-16 px-10"
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
