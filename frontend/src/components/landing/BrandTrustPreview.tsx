"use client";

import { ShieldCheck, Activity, TrendingUp, CheckCircle } from "lucide-react";
import { Badge } from "../ui/badge";

export default function BrandTrustPreview() {
  return (
    <div className="space-y-6 relative">
      {/* Header section with Brand Logo and Info */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-primary/60 p-0.5 shadow-lg shadow-primary/20">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-lg tracking-tight">Your Brand</h4>
              <span className="material-symbols-outlined text-primary text-xl variation-fill">
                verified
              </span>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Reputation Score: 98/100
            </p>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1">
          PLATINUM TIER
        </Badge>
      </div>

      {/* Stats/Metrics Preview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              Resolutions
            </span>
          </div>
          <p className="text-2xl font-black italic">1,240</p>
        </div>
        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              Sentiment
            </span>
          </div>
          <p className="text-2xl font-black italic text-emerald-500">+12%</p>
        </div>
      </div>

      {/* Resolution Timeline/Live Preview */}
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">
              Refund request resolved
            </p>
            <p className="text-[10px] text-muted-foreground">
              Successfully closed in 2 hours
            </p>
          </div>
          <div className="text-[10px] font-black text-emerald-500">
            JUST NOW
          </div>
        </div>
      </div>

      {/* Call to Action Preview */}
      <div className="pt-6 border-t border-border">
        <button className="w-full h-12 bg-primary text-white rounded-xl font-black italic shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
          <span className="material-symbols-outlined text-sm">analytics</span>
          VIEW FULL DASHBOARD
        </button>
      </div>
    </div>
  );
}
