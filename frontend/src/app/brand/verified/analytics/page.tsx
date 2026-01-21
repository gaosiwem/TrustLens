"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getVerificationAnalytics } from "../../../../api/verification.api";
import { VerificationAnalytics } from "../../../../types/verificationAnalytics";
import { AnalyticsMetricCard } from "../../../../components/analytics/AnalyticsMetricCard";
import {
  ShieldCheck,
  BarChart3,
  ArrowLeft,
  Loader2,
  Users,
  Zap,
  MessageSquareOff,
  Clock3,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import BrandHeader from "../../../../components/brand/BrandHeader";

export default function VerificationAnalyticsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<VerificationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      loadData();
    }
  }, [session?.accessToken]);

  const loadData = async () => {
    try {
      setLoading(true);
      const analyticsData = await getVerificationAnalytics(
        session!.accessToken as string,
      );
      setData(analyticsData);
    } catch (error) {
      console.error("Failed to load analytics", error);
      toast.error("Failed to load impact analytics");
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

  if (!data) return null;

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation */}
        <Link
          href="/brand/verified"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Verification
        </Link>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic tracking-tighter">
              Performance <span className="text-primary">Insights</span>
            </h2>
            <p className="text-muted-foreground font-medium max-w-xl">
              Real-time monitoring of customer trust and resolution efficiency
              metrics.
            </p>
          </div>
          <div className="p-4 rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest opacity-70">
                Overall ROI Score
              </p>
              <p className="text-xl font-black italic">Excellent Impact</p>
            </div>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <AnalyticsMetricCard
            title="Trust Score Impact"
            value={data.trustScoreAfter.toFixed(1)}
            delta={trustDelta}
            description="Overall platform credibility score comparison."
          />
          <AnalyticsMetricCard
            title="Complaint Reduction"
            value={data.complaintsAfter}
            delta={complaintDelta}
            reverseColor={true}
            description="Decrease in negative complaint velocity."
          />
          <AnalyticsMetricCard
            title="Avg Response Time"
            value={`${data.avgResponseTimeAfter}h`}
            delta={responseDelta}
            description="Improvement in resolution efficiency."
          />
          <AnalyticsMetricCard
            title="Escalation Rate"
            value={`${data.escalationRateAfter}%`}
            delta={escalationDelta}
            reverseColor={true}
            description="Percentage of cases requiring admin review."
          />
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
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-widest text-muted-foreground">
                  Profile Impressions
                </span>
                <p className="text-4xl font-black italic">
                  {data.profileViews.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Unique views on your public profile page.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-widest text-muted-foreground">
                  Badge Interactions
                </span>
                <p className="text-4xl font-black italic">
                  {data.verifiedBadgeClicks.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Clicks on your verified badge tooltip.
                </p>
              </div>
            </div>
            <div className="pt-8 border-t border-border">
              <p className="text-sm font-medium italic text-muted-foreground leading-relaxed">
                "Brands with an active verification badge see an average of 34%
                higher profile engagement compared to unverified competitors in
                the same category."
              </p>
            </div>
          </div>

          <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20 space-y-6">
            <h2 className="text-xl font-black italic tracking-tight">
              Summary Insight
            </h2>
            <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
              Since becoming verified, your brand has shown a significant
              decrease in escalated complaints and a marked improvement in
              response speed.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs font-bold leading-tight">
                  Badge displayed across all reviews
                </p>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquareOff className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs font-bold leading-tight">
                  Reduced social media backlash risk
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs font-bold leading-tight">
                  Faster resolution cycles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
