"use client";

import { ShieldCheck, Zap, Award, Info } from "lucide-react";

interface TrustBreakdownProps {
  averageRating: number;
  factors?: {
    authenticity: number;
    activity: number;
    verification: number;
  };
  calculation?: {
    totalComplaints: number;
    resolvedComplaints: number;
    highRiskResponses: number;
    isVerified: boolean;
    plan: string;
  };
}

export default function TrustBreakdown({
  averageRating,
  factors,
  calculation,
}: TrustBreakdownProps) {
  // Use provided factors or fallback to placeholder (only for preview)
  const displayFactors = factors || {
    authenticity: 85,
    activity: 92,
    verification: 100,
  };

  // Score is 0-5, convert to percentage for meter
  const percentage = (averageRating / 5) * 100;

  return (
    <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-sm space-y-8 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black tracking-tight">Trust Breakdown</h3>
        <div className="flex items-center gap-1 text-[10px] font-black tracking-widest text-primary uppercase bg-primary/10 px-2 py-1 rounded">
          Manager Exclusive
        </div>
      </div>

      {/* Radial Meter Simulation (CSS only) */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-muted fill-none"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-primary fill-none transition-all duration-1000 ease-out"
              strokeWidth="12"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * percentage) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-black text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              TrustScore
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Authenticity Score</span>
            </div>
            <span className="text-emerald-500">
              {displayFactors.authenticity}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 delay-100"
              style={{ width: `${displayFactors.authenticity}%` }}
            />
          </div>
          {calculation && calculation.highRiskResponses > 0 && (
            <p className="text-[9px] text-error font-bold tracking-tight">
              -{calculation.highRiskResponses * 5} penalty from AI-flagged
              responses
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Response Activity</span>
            </div>
            <span className="text-amber-500">{displayFactors.activity}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-1000 delay-200"
              style={{ width: `${displayFactors.activity}%` }}
            />
          </div>
          {calculation && (
            <p className="text-[9px] text-muted-foreground font-medium">
              Resolution: {calculation.resolvedComplaints} of{" "}
              {calculation.totalComplaints} complaints
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-500" />
              <span>Verification Tier</span>
            </div>
            <span className="text-blue-500">
              {displayFactors.verification}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-1000 delay-300"
              style={{ width: `${displayFactors.verification}%` }}
            />
          </div>
          {calculation && (
            <p className="text-[9px] text-muted-foreground font-medium">
              Level: {calculation.plan} (
              {calculation.isVerified ? "Verified" : "Public"})
            </p>
          )}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
        <div className="flex gap-3">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
            How is it calculated?
          </p>
        </div>
        <p className="text-[9px] text-muted-foreground/80 leading-relaxed font-medium pl-7">
          Your TrustScore starts at 100. Points are deducted based on:
          <br />• <b>Resolution Rate</b>: Penalties if under 50% or 30%.
          <br />• <b>AI Authenticity</b>: -5 points for every "High Risk"
          flagged response.
          <br />• <b>Verification</b>: Tiered bonus for Verified status and
          Premium plans.
        </p>
      </div>
    </div>
  );
}
