"use client";

import { ReactNode } from "react";
import { useSubscription } from "../context/SubscriptionContext";

/**
 * All available feature keys from subscription plans.
 * Add new features here as they're introduced.
 */
export type FeatureKey =
  // Intelligence & Monitoring Features
  | "alerts"
  | "aiInsights"
  | "sentimentTracking"
  | "brandAudit"
  | "customDescription"
  | "trustTrend"
  | "riskSignals"
  | "rootCauseAI"
  | "teamSLA"
  | "historicalBenchmarking"
  | "apiAccess"
  | "customLLM"
  | "maxTeamSeats"
  // Verified Features
  | "verifiedBadge"
  | "badgeColor"
  | "priorityQueue"
  | "standardQueue"
  | "disputeClarification"
  | "auditTrail"
  | "extendedVisibility"
  | "annualRevalidation";

/**
 * Hook to check if a specific feature is enabled for the current user.
 *
 * @param feature - The feature key to check
 * @returns boolean indicating if the feature is enabled
 *
 * @example
 * const hasAIInsights = useFeature("aiInsights");
 * if (hasAIInsights) {
 *   // Show AI insights section
 * }
 */
export function useFeature(feature: FeatureKey): boolean {
  const { features } = useSubscription();
  return !!features[feature];
}

/**
 * Hook to get a numeric feature value (like maxTeamSeats).
 *
 * @param feature - The feature key to get
 * @param defaultValue - Default value if not set
 * @returns The numeric value
 */
export function useFeatureValue(
  feature: FeatureKey,
  defaultValue: number = 0,
): number {
  const { features } = useSubscription();
  const value = features[feature];
  return typeof value === "number" ? value : defaultValue;
}

/**
 * Component to conditionally render children based on feature availability.
 *
 * @example
 * <FeatureGate feature="aiInsights">
 *   <AIInsightsPanel />
 * </FeatureGate>
 *
 * <FeatureGate feature="sentimentTracking" fallback={<UpgradePrompt />}>
 *   <SentimentChart />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const hasFeature = useFeature(feature);
  return hasFeature ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component to show when a feature requires an upgrade.
 * Can be used as the fallback for FeatureGate.
 */
export function UpgradePrompt({
  feature,
  plan = "PRO",
}: {
  feature: string;
  plan?: string;
}) {
  return (
    <div className="p-4 border rounded-lg bg-muted/50 text-center">
      <p className="text-sm text-muted-foreground mb-2">
        This feature requires the <strong>{plan}</strong> plan or higher.
      </p>
      <a
        href="/brand/pricing"
        className="text-sm font-medium text-primary hover:underline"
      >
        Upgrade Now →
      </a>
    </div>
  );
}
