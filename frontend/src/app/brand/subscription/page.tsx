"use client";

import { useSubscription } from "../../../context/SubscriptionContext";
import { Button } from "../../../components/ui/button";
import { Shield, CreditCard, History, Settings2 } from "lucide-react";
import Link from "next/link";

export default function SubscriptionPage() {
  const { plan } = useSubscription();

  const sections = [
    {
      title: "Current Status",
      description: `You are currently on the ${plan} plan.`,
      icon: Shield,
      action: "/brand/pricing",
      actionText: "Change Plan",
    },
    {
      title: "Billing Details",
      description: "Manage your payment methods and corporate VAT information.",
      icon: CreditCard,
      action: "#",
      actionText: "Update Payment",
      disabled: plan === "FREE",
    },
    {
      title: "Invoice History",
      description:
        "Access and download your historical receipts and monthly statements.",
      icon: History,
      action: "#",
      actionText: "View Invoices",
      disabled: plan === "FREE",
    },
    {
      title: "Management Settings",
      description:
        "Auto-renewal and notification preferences for your subscription.",
      icon: Settings2,
      action: "#",
      actionText: "Manage Settings",
      disabled: plan === "FREE",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <header className="mb-16">
          <h1 className="text-4xl font-black tracking-tight mb-4">
            Subscription <span className="text-primary italic">Management</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Monitor your plan usage and manage your corporate billing
            credentials.
          </p>
        </header>

        <div className="grid gap-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="p-8 rounded-[2rem] bg-card border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-primary/20 transition-all duration-500"
            >
              <div className="flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <section.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight italic mb-1">
                    {section.title}
                  </h3>
                  <p className="text-muted-foreground font-medium text-sm max-w-sm">
                    {section.description}
                  </p>
                </div>
              </div>
              <Link
                href={section.action}
                className={section.disabled ? "pointer-events-none" : ""}
              >
                <Button
                  variant={
                    section.title === "Current Status" ? "default" : "outline"
                  }
                  className="font-black rounded-xl h-12 px-8 min-w-[160px]"
                  disabled={section.disabled}
                >
                  {section.actionText}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {plan === "FREE" && (
          <div className="mt-16 p-10 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center gap-8 justify-between">
            <div className="text-center sm:text-left">
              <h4 className="text-xl font-black tracking-tight mb-2">
                Unlock Brand Foresight
              </h4>
              <p className="text-muted-foreground text-sm font-medium">
                Upgrade to PRO for real-time alerts and AI-driven sentiment
                tracking.
              </p>
            </div>
            <Link href="/brand/pricing">
              <Button className="rounded-xl font-black h-14 px-10 shadow-xl shadow-primary/20 active:scale-95 transition-all">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
