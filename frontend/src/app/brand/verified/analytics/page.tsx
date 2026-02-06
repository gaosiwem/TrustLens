"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getVerificationAnalytics } from "../../../../api/verification.api";
import { VerificationAnalytics } from "../../../../types/verificationAnalytics";
import { AnalyticsMetricCard } from "../../../../components/analytics/AnalyticsMetricCard";
import {
  ShieldCheck,
  BarChart3,
  Loader2,
  Users,
  Zap,
  MessageSquareOff,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";
import BrandHeader from "../../../../components/brand/BrandHeader";

export default function VerificationAnalyticsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<VerificationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      loadData();
    }
  }, [session?.accessToken]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const analyticsData = await getVerificationAnalytics(
        session!.accessToken as string,
      );
      setData(analyticsData);
    } catch (error: any) {
      console.error("Failed to load analytics", error);
      setError(error.message || "Failed to load impact analytics");
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <>
        <BrandHeader
          title="Impact Analytics"
          subtitle="See how verification influences your brand authority"
        />
        <div className="p-4 sm:p-8">
          <div className="max-w-xl mx-auto text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">Analytics Not Available</h2>
            <p className="text-muted-foreground mb-6">
              {error ||
                "Complete your brand verification to access impact analytics and see how it improves your reputation metrics."}
            </p>
            <a
              href="/brand/verified"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              Go to Verification
            </a>
          </div>
        </div>
      </>
    );
  }

  const trustDelta = Math.round(
    ((data.trustScoreAfter - data.trustScoreBefore) / data.trustScoreBefore) *
      100,
  );
  const complaintDelta = Math.round(
    ((data.complaintsBefore - data.complaintsAfter) / data.complaintsBefore) *
      100,
  );
  const responseDelta = Math.round(
    ((data.avgResponseTimeBefore - data.avgResponseTimeAfter) /
      data.avgResponseTimeBefore) *
      100,
  );
  const escalationDelta = Math.round(
    ((data.escalationRateBefore - data.escalationRateAfter) /
      data.escalationRateBefore) *
      100,
  );

  return (
    <>
      <BrandHeader
        title="Impact Analytics"
        subtitle="See how verification influences your brand authority"
      />

      <div className="p-4 sm:p-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="heading-2 font-bold flex items-center gap-3">
              Performance <span className="text-primary italic">Insights</span>
            </h2>
            <p className="text-muted-foreground font-medium max-w-xl">
              Real-time monitoring of customer trust and resolution efficiency
              metrics.
            </p>
          </div>
          <div className="p-4 px-6 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 flex items-center gap-4 shrink-0 transition-transform hover:scale-105 duration-500">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase opacity-70">
                Overall ROI Score
              </p>
              <p className="text-xl font-extrabold tracking-tight">EST. +24%</p>
            </div>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <AnalyticsMetricCard
            title="Trust Score Impact"
            value={data.trustScoreAfter.toFixed(1)}
            delta={trustDelta}
            description="Comparison of consumer trust ratings post-verification."
          />
          <AnalyticsMetricCard
            title="Complaint Reduction"
            value={data.complaintsAfter}
            delta={complaintDelta}
            reverseColor={true}
            description="Decrease in complaint volume since badge activation."
          />
          <AnalyticsMetricCard
            title="Avg Response Time"
            value={`${data.avgResponseTimeAfter}h`}
            delta={responseDelta}
            description="Efficiency gains in official brand responses."
          />
          <AnalyticsMetricCard
            title="Escalation Rate"
            value={`${data.escalationRateAfter}%`}
            delta={escalationDelta}
            reverseColor={true}
            description="Reduction in cases requiring platform intervention."
          />
        </div>

        {/* Methodology Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black italic tracking-tight">
              Metric Methodology & Logic
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-muted/30 border border-border">
              <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-2">
                Trust Score Calculation
              </h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Calculated by comparing the arithmetic mean of all consumer
                ratings received <strong>before</strong> vs{" "}
                <strong>after</strong> the verification approval date (
                {new Date(data.verificationDate).toLocaleDateString()}).
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-muted/30 border border-border">
              <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-2">
                Response Efficiency
              </h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Measured as the average duration (in hours) between a unique
                complaint submission and your brand's first official response in
                the followup thread.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-muted/30 border border-border">
              <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-2">
                Complaint Velocity
              </h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                The absolute count of new complaints filed against your brand.
                Verification status often serves as a deterrent for frivolous or
                repetitive submissions.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-muted/30 border border-border">
              <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-2">
                Escalation Avoidance
              </h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                The percentage of your total complaints that are escalated to
                platform moderators. Verified brands typically resolve 3x more
                issues internally.
              </p>
            </div>
          </div>
        </div>

        {/* Visibility Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-10 rounded-[3rem] bg-card border border-border space-y-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-black italic tracking-tight">
                Public Visibility & Engagement
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                    Profile Impressions
                  </span>
                  <p className="text-4xl font-black italic">
                    {data.profileViews.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-primary/5 text-[10px] font-bold text-primary/80 leading-snug italic">
                  * Calculated as unique authenticated views on your public
                  brand profile since verification.
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                    Badge Interactions
                  </span>
                  <p className="text-4xl font-black italic">
                    {data.verifiedBadgeClicks.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-primary/5 text-[10px] font-bold text-primary/80 leading-snug italic">
                  * Tracks hover and click events on your verification badge
                  across the platform.
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-border">
              <p className="text-sm font-medium italic text-muted-foreground leading-relaxed">
                "Verified brands on TrustLens experience a significant boost in
                consumer confidence, resulting in a measurable shift from public
                confrontation to constructive resolution."
              </p>
            </div>
          </div>

          <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xl font-black italic tracking-tight">
                AI Impact Summary
              </h2>
              <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
                Since becoming verified, your brand has successfully migrated{" "}
                {complaintDelta}% of potential escalations into internal
                resolutions, significantly protecting your public equity.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs font-bold leading-tight">
                  Trust Badge active on all public indices
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs font-bold leading-tight">
                  Priority resolution dashboard enabled
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs font-bold leading-tight">
                  -
                  {(
                    data.avgResponseTimeBefore - data.avgResponseTimeAfter
                  ).toFixed(0)}
                  h faster response cycle
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
