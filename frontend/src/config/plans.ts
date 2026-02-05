export type PlanCode = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE" | "VERIFIED";

export interface PlanFeature {
  plan: PlanCode;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const REPUTATION_PLANS: PlanFeature[] = [
  {
    plan: "FREE",
    price: "R0",
    description:
      "Neutral grounds for every South African brand. Monitor and respond without barriers.",
    features: [
      "Claim your brand profile",
      "Unlimited responses to complaints",
      "Basic response drafting",
      "Standard platform dashboard",
      "Google Reviews Posting",
    ],
  },
  {
    plan: "PRO",
    price: "R499",
    description:
      "Advanced monitoring for growing brands who value immediate feedback.",
    features: [
      "Real-time email alerts",
      "AI-driven sentiment tracking",
      "Brand health audit (Quarterly)",
      "Custom brand description",
    ],
  },
  {
    plan: "BUSINESS",
    price: "R1,499",
    popular: true,
    description:
      "Strategic intelligence and team workflow for professional reputation managers.",
    features: [
      "Trust Trend Score (AI Forecast)",
      "Reputation Risk Early-Warning",
      "Root cause AI analysis",
      "Historical Benchmarking",
      "Team member assignments & SLAs",
    ],
  },
  {
    plan: "ENTERPRISE",
    price: "Custom",
    description:
      "Multi-brand intelligence and custom AI integrations for national conglomerates.",
    features: [
      "API access to data streams",
      "Custom LLM training on history",
      "Unlimited team seats",
    ],
  },
];

export const VERIFICATION_PLANS: PlanFeature[] = [
  {
    plan: "VERIFIED",
    price: "R500",
    description:
      "Essential identity verification and trusted status for your brand.",
    features: [
      "Business identity verification",
      "Verified badge on profile",
      "Priority verification queue",
      "Fast-track dispute clarification",
      "Verification audit trail",
      "Extended badge visibility",
      "Annual status re-validation",
    ],
  },
];

export const ALL_PLANS = [...REPUTATION_PLANS, ...VERIFICATION_PLANS];
