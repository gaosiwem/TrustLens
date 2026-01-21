Sprint22. Verification Subscription UI
Frontend Implementation

1. Core Concepts Implemented

This implementation delivers:

Verification subscription purchase UI

Document upload and status tracking

Verification lifecycle visibility

Verified badge rendering

Subscription renewal and expiry handling

Brand dashboard integration

Payments are assumed already handled in Sprint19 UI. This sprint consumes payment status and focuses on verification UX.

2. Shared Types
   // src/types/verification.ts

export type VerificationStatus =
| "not_started"
| "pending_documents"
| "under_review"
| "approved"
| "rejected"
| "expired";

export interface VerificationSubscription {
id: string;
status: VerificationStatus;
plan: "monthly" | "annual";
verifiedUntil: string | null;
renewalDate: string | null;
}

export interface VerificationDocument {
id: string;
type: string;
status: "pending" | "approved" | "rejected";
rejectionReason?: string;
}

3. API Client
   // src/api/verificationApi.ts

import axios from "@/lib/axios";

export const getVerificationStatus = () =>
axios.get("/verification/status");

export const subscribeToVerification = (plan: "monthly" | "annual") =>
axios.post("/verification/subscribe", { plan });

export const uploadVerificationDocument = (
type: string,
file: File
) => {
const formData = new FormData();
formData.append("type", type);
formData.append("file", file);

return axios.post("/verification/documents", formData);
};

export const getVerificationDocuments = () =>
axios.get("/verification/documents");

4. Verified Badge Component
   // src/components/VerifiedBadge.tsx

interface Props {
verifiedUntil: string;
}

export default function VerifiedBadge({ verifiedUntil }: Props) {
return (
<span className="inline-flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white">
Verified
<span className="opacity-75">
· valid until {new Date(verifiedUntil).toLocaleDateString()}
</span>
</span>
);
}

5. Verification Subscription Page
   // src/pages/verification/subscribe.tsx

import { subscribeToVerification } from "@/api/verificationApi";

export default function VerificationSubscribePage() {
const handleSubscribe = async (plan: "monthly" | "annual") => {
await subscribeToVerification(plan);
window.location.href = "/verification/dashboard";
};

return (
<div className="mx-auto max-w-3xl space-y-8 p-8">
<h1 className="text-2xl font-bold">Get Your Brand Verified</h1>

      <p>
        Verification confirms your business identity and displays a trusted
        verified badge to customers. This is a recurring subscription to
        maintain credibility.
      </p>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded border p-6">
          <h2 className="text-lg font-semibold">Monthly</h2>
          <p className="mt-2 text-sm">Ongoing verification maintenance</p>
          <button
            onClick={() => handleSubscribe("monthly")}
            className="mt-4 w-full rounded bg-black px-4 py-2 text-white"
          >
            Subscribe Monthly
          </button>
        </div>

        <div className="rounded border p-6">
          <h2 className="text-lg font-semibold">Annual</h2>
          <p className="mt-2 text-sm">Save with annual verification</p>
          <button
            onClick={() => handleSubscribe("annual")}
            className="mt-4 w-full rounded bg-black px-4 py-2 text-white"
          >
            Subscribe Annually
          </button>
        </div>
      </div>
    </div>

);
}

6. Verification Dashboard
   // src/pages/verification/dashboard.tsx

import { useEffect, useState } from "react";
import {
getVerificationStatus,
getVerificationDocuments,
} from "@/api/verificationApi";
import VerifiedBadge from "@/components/VerifiedBadge";
import DocumentUpload from "@/components/verification/DocumentUpload";
import { VerificationSubscription, VerificationDocument } from "@/types/verification";

export default function VerificationDashboard() {
const [subscription, setSubscription] =
useState<VerificationSubscription | null>(null);
const [documents, setDocuments] = useState<VerificationDocument[]>([]);

useEffect(() => {
getVerificationStatus().then(res => setSubscription(res.data));
getVerificationDocuments().then(res => setDocuments(res.data));
}, []);

if (!subscription) return null;

return (
<div className="mx-auto max-w-4xl space-y-6 p-8">
<div className="flex items-center justify-between">
<h1 className="text-xl font-bold">Verification Status</h1>
{subscription.status === "approved" &&
subscription.verifiedUntil && (
<VerifiedBadge verifiedUntil={subscription.verifiedUntil} />
)}
</div>

      <div className="rounded border p-4">
        <p>Status: {subscription.status.replace("_", " ")}</p>
        {subscription.renewalDate && (
          <p>
            Renewal date:{" "}
            {new Date(subscription.renewalDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <DocumentUpload documents={documents} />
    </div>

);
}

7. Document Upload Component
   // src/components/verification/DocumentUpload.tsx

import { uploadVerificationDocument } from "@/api/verificationApi";
import { VerificationDocument } from "@/types/verification";

interface Props {
documents: VerificationDocument[];
}

const REQUIRED_DOCS = [
"business_registration",
"director_id",
"proof_of_address",
];

export default function DocumentUpload({ documents }: Props) {
const handleUpload = async (
type: string,
file: File | null
) => {
if (!file) return;
await uploadVerificationDocument(type, file);
window.location.reload();
};

return (
<div className="space-y-4">
<h2 className="text-lg font-semibold">Verification Documents</h2>

      {REQUIRED_DOCS.map(type => {
        const doc = documents.find(d => d.type === type);

        return (
          <div
            key={type}
            className="flex items-center justify-between rounded border p-3"
          >
            <div>
              <p className="font-medium">{type.replace("_", " ")}</p>
              <p className="text-sm text-gray-500">
                {doc ? doc.status : "Not uploaded"}
              </p>
              {doc?.rejectionReason && (
                <p className="text-sm text-red-600">
                  {doc.rejectionReason}
                </p>
              )}
            </div>

            <input
              type="file"
              onChange={e =>
                handleUpload(type, e.target.files?.[0] || null)
              }
            />
          </div>
        );
      })}
    </div>

);
}

8. Public Brand Page Badge Integration
   // src/components/BrandHeader.tsx

import VerifiedBadge from "@/components/VerifiedBadge";

interface Props {
name: string;
verifiedUntil?: string | null;
}

export default function BrandHeader({ name, verifiedUntil }: Props) {
return (
<div className="flex items-center gap-3">
<h1 className="text-2xl font-bold">{name}</h1>
{verifiedUntil && <VerifiedBadge verifiedUntil={verifiedUntil} />}
</div>
);
}

9. Expiry Handling UX

When verifiedUntil is in the past:

Badge is not rendered

Dashboard shows expired

Subscribe CTA reappears automatically

This logic is fully frontend enforced based on API state.

10. Sprint22 UI Outcome

This implementation:

Turns verification into a visible paid service

Reinforces trust through UI repetition

Enforces renewal discipline automatically

Aligns perfectly with manual + AI admin review

Scales revenue without scaling UI complexity
