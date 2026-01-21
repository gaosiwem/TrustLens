"use client";

import { AlertTriangle, ShieldX, Clock } from "lucide-react";

interface Enforcement {
  id: string;
  actionType: string;
  reason: string;
  createdAt: string;
  expiresAt?: string;
}

interface EnforcementNoticeProps {
  enforcements: Enforcement[];
}

export default function EnforcementNotice({
  enforcements,
}: EnforcementNoticeProps) {
  if (enforcements.length === 0) return null;

  const latest = enforcements[0];
  const isCritical =
    latest.actionType === "SUSPENSION" || latest.actionType === "BAN";

  return (
    <div
      className={`p-6 rounded-[2rem] border-2 shadow-xl animate-in fade-in slide-in-from-top duration-500 mb-8 overflow-hidden relative ${
        isCritical
          ? "bg-red-500/10 border-red-500/20"
          : "bg-amber-500/10 border-amber-500/20"
      }`}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl ${
          isCritical ? "bg-red-500/20" : "bg-amber-500/20"
        }`}
      />

      <div className="relative z-10 flex items-start gap-6">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
            isCritical
              ? "bg-red-500 text-white shadow-red-500/20"
              : "bg-amber-500 text-white shadow-amber-500/20"
          }`}
        >
          {isCritical ? (
            <ShieldX className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4
              className={`text-lg font-black tracking-tight ${
                isCritical ? "text-red-500" : "text-amber-500"
              }`}
            >
              {latest.actionType.replace(/_/g, " ")} In Effect
            </h4>
            <span className="text-[10px] font-black tracking-widest uppercase bg-foreground/10 px-2 py-0.5 rounded">
              Active Enforcement
            </span>
          </div>
          <p className="text-sm font-medium text-foreground/80 mb-4 italic">
            "{latest.reason}"
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <Clock className="w-3.3 h-3.3" />
              Started: {new Date(latest.createdAt).toLocaleDateString()}
            </div>
            {latest.expiresAt && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <ShieldX className="w-3.3 h-3.3" />
                Ends: {new Date(latest.expiresAt).toLocaleDateString()}
              </div>
            )}
            <button
              className={`ml-auto px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border-2 ${
                isCritical
                  ? "border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white"
              }`}
            >
              Appeal Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
