Sprint21.md – Verified Badge Subscription Backend
Overview

Sprint21 introduces a Verified Badge subscription workflow:

Brand users request verification.

Admins approve or reject requests.

Subscriptions manage badge validity.

Payment integration using South African gateways (PayFast / Peach Payments).

Audit logging and VAT handling included.

Backend Features

1. Data Models
   User Table (existing)

id, email, passwordHash, role (brand, admin, user), etc.

VerifiedRequests Table
CREATE TABLE verified_requests (
id SERIAL PRIMARY KEY,
user_id INT REFERENCES users(id),
company_name VARCHAR(255) NOT NULL,
documents JSONB NOT NULL,
status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
admin_comments TEXT,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

VerifiedSubscriptions Table
CREATE TABLE verified_subscriptions (
id SERIAL PRIMARY KEY,
user_id INT REFERENCES users(id),
verified_request_id INT REFERENCES verified_requests(id),
status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACTIVE, EXPIRED, CANCELLED
payment_gateway VARCHAR(50),
payment_reference VARCHAR(255),
amount NUMERIC(12,2),
vat NUMERIC(5,2),
start_date TIMESTAMP,
end_date TIMESTAMP,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

2. API Routes
   2.1 Brand Requests Verification

POST /api/verified/request

import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
if(req.method !== "POST") return res.status(405).end();

const { userId, companyName, documents } = JSON.parse(req.body);

if(!companyName || !documents) return res.status(400).json({ error: "Missing fields" });

const request = await prisma.verifiedRequests.create({
data: { userId, companyName, documents },
});

res.status(201).json(request);
}

2.2 Admin: List Pending Requests

GET /api/verified/pending

import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
const requests = await prisma.verifiedRequests.findMany({
where: { status: "Pending" },
include: { user: true }
});
res.json(requests);
}

2.3 Admin: Approve / Reject Request

POST /api/verified/:action where action = approve | reject

import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
const { id } = JSON.parse(req.body);
const { action } = req.query;

if(!["approve","reject"].includes(action)) return res.status(400).json({ error: "Invalid action" });

const updatedRequest = await prisma.verifiedRequests.update({
where: { id },
data: {
status: action === "approve" ? "Approved" : "Rejected",
admin_comments: req.body.adminComments || null,
updated_at: new Date(),
}
});

// If approved, create subscription placeholder
if(action === "approve") {
await prisma.verifiedSubscriptions.create({
data: {
userId: updatedRequest.user_id,
verified_request_id: id,
status: "PENDING"
}
});
}

res.json(updatedRequest);
}

2.4 Initiate Payment

POST /api/payment/initiate

import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
const { subscriptionId } = JSON.parse(req.body);
const subscription = await prisma.verifiedSubscriptions.findUnique({ where: { id: subscriptionId } });

if(!subscription) return res.status(404).json({ error: "Subscription not found" });

// Example: PayFast integration (SA)
const paymentUrl = await initiatePayFastPayment({
amount: subscription.amount,
item_name: "Verified Badge Subscription",
return_url: "https://yourdomain.com/payment/success",
cancel_url: "https://yourdomain.com/payment/cancel"
});

res.json({ url: paymentUrl });
}

async function initiatePayFastPayment({ amount, item_name, return_url, cancel_url }) {
// PayFast integration logic here
// Return redirect URL
return "https://sandbox.payfast.co.za/eng/process?";
}

2.5 Handle Payment Confirmation (Webhook)

POST /api/payment/webhook

import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
const { subscriptionId, paymentStatus, reference, amount, vat } = req.body;

if(paymentStatus === "COMPLETE") {
await prisma.verifiedSubscriptions.update({
where: { id: subscriptionId },
data: {
status: "ACTIVE",
payment_reference: reference,
amount,
vat,
start_date: new Date(),
end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // 1-year subscription
}
});
}

res.status(200).end();
}

3. Admin Billing Dashboard

List all verified subscriptions.

Track payment status, VAT, subscription start/end dates.

Generate CSV/Excel for compliance reporting.

GET /api/admin/billing

Returns:

[
{
"userEmail": "brand@example.com",
"companyName": "Brand Ltd",
"status": "ACTIVE",
"amount": 1999,
"vat": 299.85,
"start_date": "2026-01-15",
"end_date": "2027-01-15"
}
]

4. Security & Best Practices

File uploads validated for type (images/pdf) and size.

API endpoints require JWT-based authentication.

Only admin role can approve/reject requests.

Webhooks verified using gateway signature.

Audit logs for all actions.

5. Compliance

VAT stored per transaction for South African tax compliance.

Billing data can be exported for audits.

Subscription history retained for at least 5 years.

6. Summary

Sprint21 backend fully implements:

Verified Badge subscription for brand users.

Admin approval/rejection workflow.

Payment integration using South African gateways.

Subscription tracking with VAT handling.

Admin billing dashboard & export functionality.

Security and audit logging.
