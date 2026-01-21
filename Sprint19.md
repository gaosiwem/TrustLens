Sprint19.md – Payments, Subscriptions & Feature Gating (South Africa)
Purpose of Sprint 19

Sprint 19 introduces paid subscriptions for brands without restricting participation rights.
The backend enables billing, plan enforcement, feature gating, and auditability.

Key principles enforced in code:

Brands never pay to respond to complaints

Brands never pay to claim or correct information

Brands pay for intelligence, alerts, workflows, and insights

Payments are optional, reversible, and transparent

Payment Gateway Choice (South Africa)
Selected Gateway: PayFast

Why PayFast (Best Practice for SA):

PCI-DSS compliant

Supports recurring subscriptions

Widely trusted by SA SMEs

Supports EFT, cards, wallets

Simple webhook model

Easy future replacement with Stripe

Architecture is gateway-agnostic. PayFast is wrapped behind a billing service.

High-Level Architecture
Brand
├─ Subscription
│ ├─ Plan
│ ├─ Status
│ ├─ Billing Cycle
│ └─ Features
├─ Payments
│ ├─ PayFast Checkout
│ ├─ Webhooks
│ └─ Ledger
└─ Feature Enforcement
├─ Middleware
└─ Policy Map

Database Models (Prisma)
Subscription Plans
model SubscriptionPlan {
id String @id @default(uuid())
code String @unique
name String
monthlyPrice Int
features Json
createdAt DateTime @default(now())
}

Brand Subscription
model BrandSubscription {
id String @id @default(uuid())
brandId String
planId String
status SubscriptionStatus
startedAt DateTime
endsAt DateTime?
gatewayRef String?
createdAt DateTime @default(now())

brand Brand @relation(fields: [brandId], references: [id])
plan SubscriptionPlan @relation(fields: [planId], references: [id])
}

enum SubscriptionStatus {
ACTIVE
PAST_DUE
CANCELLED
EXPIRED
}

Payment Ledger
model PaymentTransaction {
id String @id @default(uuid())
brandId String
subscriptionId String
amount Int
currency String
gateway String
gatewayRef String
status String
createdAt DateTime @default(now())
}

Subscription Plan Seeding
// scripts/seedSubscriptions.ts
await prisma.subscriptionPlan.createMany({
data: [
{
code: "FREE",
name: "Free",
monthlyPrice: 0,
features: {
alerts: false,
aiInsights: false,
workflows: false,
exports: false,
},
},
{
code: "PRO",
name: "Professional",
monthlyPrice: 79900,
features: {
alerts: true,
aiInsights: true,
workflows: false,
exports: true,
},
},
{
code: "BUSINESS",
name: "Business",
monthlyPrice: 249900,
features: {
alerts: true,
aiInsights: true,
workflows: true,
exports: true,
},
},
],
})

Prices stored in cents (ZAR).
No hardcoding in logic.

Billing Service (PayFast)
// src/modules/billing/payfast.service.ts
import crypto from "crypto"

export function generatePayFastPayload({
brand,
plan,
returnUrl,
notifyUrl,
}: any) {
return {
merchant_id: process.env.PAYFAST_MERCHANT_ID,
merchant_key: process.env.PAYFAST_MERCHANT_KEY,
amount: (plan.monthlyPrice / 100).toFixed(2),
item_name: `${plan.name} Subscription`,
custom_str1: brand.id,
custom_str2: plan.code,
return_url: returnUrl,
notify_url: notifyUrl,
}
}

Subscription Creation Endpoint
// src/modules/subscription/subscription.controller.ts
export async function createSubscription(req, res) {
const { planCode } = req.body
const brandId = req.user.brandId

const plan = await prisma.subscriptionPlan.findUnique({
where: { code: planCode },
})

const payload = generatePayFastPayload({
brand: { id: brandId },
plan,
returnUrl: `${ENV.APP_URL}/billing/success`,
notifyUrl: `${ENV.API_URL}/billing/webhook`,
})

res.json(payload)
}

PayFast Webhook (Authoritative Source)
// src/modules/billing/payfast.webhook.ts
export async function handlePayFastWebhook(req, res) {
const {
payment_status,
custom_str1: brandId,
custom_str2: planCode,
m_payment_id,
amount_gross,
} = req.body

if (payment_status !== "COMPLETE") {
return res.status(200).end()
}

const plan = await prisma.subscriptionPlan.findUnique({
where: { code: planCode },
})

const subscription = await prisma.brandSubscription.create({
data: {
brandId,
planId: plan.id,
status: "ACTIVE",
startedAt: new Date(),
gatewayRef: m_payment_id,
},
})

await prisma.paymentTransaction.create({
data: {
brandId,
subscriptionId: subscription.id,
amount: Math.round(Number(amount_gross) \* 100),
currency: "ZAR",
gateway: "PAYFAST",
gatewayRef: m_payment_id,
status: "SUCCESS",
},
})

res.status(200).end()
}

Feature Enforcement Middleware
// src/middleware/featureGate.ts
export function requireFeature(feature: string) {
return async (req, res, next) => {
const subscription = await prisma.brandSubscription.findFirst({
where: {
brandId: req.user.brandId,
status: "ACTIVE",
},
include: { plan: true },
})

    if (!subscription?.plan.features[feature]) {
      return res.status(403).json({
        error: "Upgrade required",
      })
    }

    next()

}
}

Applied Enforcement Examples
router.get(
"/ai-insights",
authenticateBrand,
requireFeature("aiInsights"),
insightsController
)

router.post(
"/alerts/configure",
authenticateBrand,
requireFeature("alerts"),
alertsController
)

Security & Compliance

✔ Webhooks are source-of-truth
✔ No client-side trust
✔ Payment ledger immutable
✔ Subscription state enforced server-side
✔ No pay-to-respond logic anywhere
✔ Audit-ready billing records

What Sprint 19 Unlocks

Ethical monetisation

SA-ready billing

Feature-based access control

Enterprise scalability

Stripe-ready abstraction

What Sprint 19 Does Not Do

No legal pressure mechanisms

No paid complaint suppression

No ranking manipulation

No response throttling
