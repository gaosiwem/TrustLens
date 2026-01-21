Sprint19-UI.md – Paid Intelligence, Alerts & Subscription (Full UI Implementation)
Overview

Sprint 19 introduces paid intelligence features for TrustLens without restricting any fundamental participation rights.

Never gated:

Viewing complaints

Responding to complaints

Claiming a brand

Correcting information

Paid value = foresight, insight, workflow efficiency

Tech Stack

Next.js App Router

TailwindCSS

shadcn/ui

React Hook Form

Lucide Icons

Feature gating via subscription context

Folder Structure
app/
└─ brand/
├─ pricing/
│ └─ page.tsx
├─ alerts/
│ └─ page.tsx
├─ insights/
│ └─ page.tsx
├─ reputation/
│ └─ page.tsx
├─ workflows/
│ └─ page.tsx
└─ subscription/
└─ page.tsx
components/
├─ subscription/
│ ├─ PlanCard.tsx
│ ├─ FeatureGate.tsx
│ └─ UpgradeCTA.tsx
├─ charts/
└─ layout/
context/
└─ SubscriptionContext.tsx

Subscription Context (Feature Gating)
// context/SubscriptionContext.tsx
"use client"

import { createContext, useContext } from "react"

export type Plan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE"

const SubscriptionContext = createContext<{ plan: Plan }>({ plan: "FREE" })

export const useSubscription = () => useContext(SubscriptionContext)

export const SubscriptionProvider = ({
plan,
children,
}: {
plan: Plan
children: React.ReactNode
}) => {
return (
<SubscriptionContext.Provider value={{ plan }}>
{children}
</SubscriptionContext.Provider>
)
}

Feature Gate Component
// components/subscription/FeatureGate.tsx
"use client"

import { Lock } from "lucide-react"
import { useSubscription } from "@/context/SubscriptionContext"

export function FeatureGate({
allowed,
children,
}: {
allowed: ("PRO" | "BUSINESS" | "ENTERPRISE")[]
children: React.ReactNode
}) {
const { plan } = useSubscription()

if (!allowed.includes(plan as any)) {
return (
<div className="relative rounded-xl border bg-muted/40 p-4">
<div className="absolute inset-0 backdrop-blur-sm rounded-xl" />
<div className="relative z-10 flex items-center gap-2 text-sm text-muted-foreground">
<Lock className="h-4 w-4" />
Upgrade to unlock this insight
</div>
</div>
)
}

return <>{children}</>
}

Pricing Page
// app/brand/pricing/page.tsx
import { PlanCard } from "@/components/subscription/PlanCard"

export default function PricingPage() {
return (
<div className="container py-10 space-y-8">
<h1 className="text-3xl font-bold">Plans built on trust</h1>
<p className="text-muted-foreground max-w-2xl">
You never pay to respond, defend, or correct information.
You pay for early signals, insight, and operational intelligence.
</p>

      <div className="grid md:grid-cols-4 gap-6">
        <PlanCard plan="FREE" />
        <PlanCard plan="PRO" />
        <PlanCard plan="BUSINESS" />
        <PlanCard plan="ENTERPRISE" />
      </div>
    </div>

)
}

Alerts Configuration UI
// app/brand/alerts/page.tsx
"use client"

import { Switch } from "@/components/ui/switch"
import { FeatureGate } from "@/components/subscription/FeatureGate"

export default function AlertsPage() {
return (
<div className="container py-10 space-y-6">
<h1 className="text-2xl font-semibold">Monitoring & Alerts</h1>

      <FeatureGate allowed={["PRO", "BUSINESS", "ENTERPRISE"]}>
        <div className="space-y-4">
          {[
            "New complaint alerts",
            "Volume spike alerts",
            "Sentiment shift alerts",
            "Benchmark deviation alerts",
          ].map((alert) => (
            <div key={alert} className="flex justify-between items-center border p-4 rounded-lg">
              <span>{alert}</span>
              <Switch />
            </div>
          ))}
        </div>
      </FeatureGate>
    </div>

)
}

AI Insights Dashboard
// app/brand/insights/page.tsx
import { FeatureGate } from "@/components/subscription/FeatureGate"

export default function InsightsPage() {
return (
<div className="container py-10 space-y-6">
<h1 className="text-2xl font-semibold">AI Insights</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <FeatureGate allowed={["PRO", "BUSINESS", "ENTERPRISE"]}>
          <div className="p-6 border rounded-xl">
            Complaint categorisation trends
          </div>
        </FeatureGate>

        <FeatureGate allowed={["BUSINESS", "ENTERPRISE"]}>
          <div className="p-6 border rounded-xl">
            Root cause analysis
          </div>
        </FeatureGate>

        <FeatureGate allowed={["BUSINESS", "ENTERPRISE"]}>
          <div className="p-6 border rounded-xl">
            Sentiment over time
          </div>
        </FeatureGate>
      </div>
    </div>

)
}

Reputation Intelligence
// app/brand/reputation/page.tsx
import { FeatureGate } from "@/components/subscription/FeatureGate"

export default function ReputationPage() {
return (
<div className="container py-10 space-y-6">
<h1 className="text-2xl font-semibold">Reputation Intelligence</h1>

      <FeatureGate allowed={["BUSINESS", "ENTERPRISE"]}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-xl">
            Trust trend score
          </div>
          <div className="p-6 border rounded-xl">
            Early reputation risk signals
          </div>
        </div>
      </FeatureGate>
    </div>

)
}

Workflow Tools
// app/brand/workflows/page.tsx
import { FeatureGate } from "@/components/subscription/FeatureGate"

export default function WorkflowsPage() {
return (
<div className="container py-10 space-y-6">
<h1 className="text-2xl font-semibold">Internal Workflows</h1>

      <FeatureGate allowed={["BUSINESS", "ENTERPRISE"]}>
        <ul className="space-y-3">
          <li>Assign complaints to team members</li>
          <li>Private internal notes</li>
          <li>Resolution timelines</li>
          <li>Export reports</li>
        </ul>
      </FeatureGate>
    </div>

)
}

Subscription Management
// app/brand/subscription/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { useSubscription } from "@/context/SubscriptionContext"

export default function SubscriptionPage() {
const { plan } = useSubscription()

return (
<div className="container py-10 space-y-6">
<h1 className="text-2xl font-semibold">Subscription</h1>

      <div className="border rounded-xl p-6">
        <p>Current plan: <strong>{plan}</strong></p>

        <div className="mt-4 flex gap-4">
          <Button>Upgrade</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </div>

)
}

Acceptance Criteria

✔ No complaint interaction gated
✔ Paid features are additive only
✔ Clear trust messaging
✔ Reversible subscription actions
✔ Consistent UI with previous sprints

Final Outcome

Sprint19-UI completes TrustLens’ transition into a reputation intelligence platform while preserving neutrality, fairness, and public trust.

You are monetising foresight, not fear.
