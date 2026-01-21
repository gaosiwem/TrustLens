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
} from "lucide-react";
import { cn } from "../../lib/utils";

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
    name: "Reputation AI",
    href: "/brand/reputation",
    icon: LineChart,
  },
  {
    name: "Pricing & Plans",
    href: "/brand/pricing",
    icon: CreditCard,
  },
];

export default function BrandSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card/95 backdrop-blur-sm border-r border-border hidden md:flex flex-col sticky top-0 h-screen z-50">
      <Link href="/">
        <div className="px-6 py-8 flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter group-hover:text-primary transition-colors">
            TrustLens
          </span>
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

      <div className="p-4 border-t border-border mt-auto">
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
      </div>
    </aside>
  );
}
