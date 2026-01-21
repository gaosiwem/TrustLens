"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText as ReceiptLong,
  PlusCircle,
  TrendingUp,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";
import clsx from "clsx";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSidebar: FC<UserSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/complaints",
      label: "My Complaints",
      icon: ReceiptLong,
    },
    {
      href: "/dashboard/complaints/create",
      label: "New Complaint",
      icon: PlusCircle,
    },
    { href: "/dashboard/insights", label: "AI Insights", icon: TrendingUp },
  ];

  const bottomLinks = [
    { href: "/profile", label: "Settings", icon: Settings },
    { href: "/help", label: "Help Center", icon: HelpCircle },
  ];

  const BrandLogo = () => (
    <Link href="/" className="flex items-center gap-3 px-2 mb-8 group">
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
        <span className="text-white font-black text-xl italic">T</span>
      </div>
      <span className="text-2xl font-black tracking-tighter italic">
        Trust<span className="text-primary">Lens</span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={clsx(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-50 w-72 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between lg:block">
            <BrandLogo />
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 mt-4">
            <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase px-4 mb-4">
              Main Navigation
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => onClose()}
                >
                  <Icon
                    className={clsx(
                      "w-5 h-5",
                      isActive
                        ? ""
                        : "group-hover:scale-110 transition-transform",
                    )}
                  />
                  {link.label}
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 pt-6 border-t border-border/60">
            {bottomLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all group"
                  onClick={() => onClose()}
                >
                  <Icon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 p-6 rounded-4xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-primary/20 transition-colors" />
            <p className="text-[10px] font-black tracking-widest text-primary uppercase mb-2">
              Pro Support
            </p>
            <p className="text-xs font-bold text-foreground/70 leading-relaxed italic mb-4">
              Get priority assistance and AI insights.
            </p>
            <button className="w-full py-2.5 bg-background border border-border rounded-xl text-xs font-black shadow-sm hover:shadow-md transition-all">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;
