export type PlanCode =
  | "FREE"
  | "PRO"
  | "BUSINESS"
  | "ENTERPRISE"
  | "BASIC_VERIFIED"
  | "PREMIUM_VERIFIED";

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
      "Team member assignments & SLAs",
    ],
  },
  {
    plan: "ENTERPRISE",
    price: "Custom",
    description:
      "Multi-brand intelligence and custom AI integrations for national conglomerates.",
    features: [
      "Historical Benchmarking",
      "API access to data streams",
      "Custom LLM training on history",
      "Unlimited team seats",
    ],
  },
];

export const VERIFICATION_PLANS: PlanFeature[] = [
  {
    plan: "BASIC_VERIFIED",
    price: "R500",
    description:
      "Essential identity verification for SMEs, sole proprietors, and new businesses.",
    features: [
      "Business identity verification",
      "Verified badge",
      "Annual status re-validation",
      "Standard processing queue",
    ],
  },
  {
    plan: "PREMIUM_VERIFIED",
    price: "R1,500",
    popular: true,
    description:
      "Advanced authority and governance for established brands. Best for corporate trust.",
    features: [
      "Everything in Basic",
      "Priority verification queue",
      "Fast-track dispute clarification",
      "Verification audit trail",
      "Extended badge visibility",
    ],
  },
];

export const ALL_PLANS = [...REPUTATION_PLANS, ...VERIFICATION_PLANS];
