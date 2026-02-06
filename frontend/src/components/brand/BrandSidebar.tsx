"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Verified,
  LineChart,
  CreditCard,
  BarChart4,
  Settings,
  Shield,
  HelpCircle,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useSubscription } from "../../context/SubscriptionContext";

const NAV_ITEMS = [
  {
    name: "Brand Overview",
    href: "/brand/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Verification",
    href: "/brand/verified",
    icon: Verified,
  },
  {
    name: "Insights & Analytics",
    href: "/brand/verified/analytics",
    icon: BarChart4,
  },
  {
    name: "Sentiment Analytics",
    href: "/brand/analytics/sentiment",
    icon: LineChart,
  },
  {
    name: "Reputation AI",
    href: "/brand/reputation",
    icon: Shield,
  },
  {
    name: "Pricing & Plans",
    href: "/brand/pricing",
    icon: CreditCard,
  },
];

export default function BrandSidebar() {
  const pathname = usePathname();
  const { plan, activePlans } = useSubscription();

  return (
    <aside className="w-64 bg-card/95 backdrop-blur-sm border-r border-border hidden md:flex flex-col sticky top-0 h-screen z-50">
      <Link href="/">
        <div className="px-6 py-8 flex items-center gap-3 cursor-pointer group">
          <img
            src="/logo.png"
            alt="TrustLens"
            className="h-24 w-auto group-hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      <nav className="flex-1 flex flex-col px-3 gap-1.5 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary text-white font-bold shadow-lg shadow-primary/20"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground font-medium",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground group-hover:text-primary transition-colors",
                )}
              />
              <span className="text-sm tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Plan Display Section */}
      <div className="px-3 py-4 space-y-4">
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/50">
                {activePlans && activePlans.length > 1
                  ? "Active Plans"
                  : "Current Plan"}
              </span>
            </div>
            <div className="space-y-0.5">
              {(() => {
                const intelligencePlans = ["PRO", "BUSINESS", "ENTERPRISE"];
                const verificationPlans = ["VERIFIED"];

                const activeIntelligence = (activePlans || [])
                  .filter((p) => intelligencePlans.includes(p))
                  .slice(-1);
                const activeVerification = (activePlans || [])
                  .filter((p) => verificationPlans.includes(p))
                  .slice(-1);

                // If no paid intelligence plan, show FREE
                const intelToDisplay =
                  activeIntelligence.length > 0 ? activeIntelligence : ["FREE"];
                const allToDisplay = Array.from(
                  new Set([...intelToDisplay, ...activeVerification]),
                );

                return allToDisplay.map((p, idx) => (
                  <p
                    key={idx}
                    className={cn(
                      "font-bold tracking-tight text-foreground leading-none",
                      allToDisplay.length > 1 ? "text-[10px]" : "text-sm",
                    )}
                  >
                    {p.replace("_", " ")}
                  </p>
                ));
              })()}
            </div>
            <Link
              href="/brand/pricing"
              className="mt-2 block text-[9px] font-bold text-primary hover:underline uppercase tracking-widest"
            >
              {plan === "ENTERPRISE" ? "Manage" : "Upgrade →"}
            </Link>
          </div>
        </div>

        <div className="pt-2 space-y-1">
          <Link
            href="/brand/settings"
            className={cn(
              "flex items-center gap-3 py-3 px-4 rounded-xl transition-all hover:bg-muted text-muted-foreground hover:text-foreground font-medium",
              pathname === "/brand/settings" && "bg-muted text-foreground",
            )}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Settings</span>
          </Link>
          <Link
            href="/help"
            className={cn(
              "flex items-center gap-3 py-3 px-4 rounded-xl transition-all hover:bg-muted text-muted-foreground hover:text-foreground font-medium",
              pathname === "/help" && "bg-muted text-foreground",
            )}
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Help & Support</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
