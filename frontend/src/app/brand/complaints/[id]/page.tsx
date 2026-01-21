"use client";

import { useParams, useRouter } from "next/navigation";
import ComplaintDetail from "../../../../components/ComplaintDetail";
import BrandHeader from "../../../../components/brand/BrandHeader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BrandComplaintDetailsPage() {
  const params = useParams();
  const complaintId = params.id as string;
  const router = useRouter();

  return (
    <>
      <BrandHeader
        title="Complaint Details"
        subtitle="Review and respond to consumer issues"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 font-bold">
        <Link
          href="/brand/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 sm:px-6">
        <ComplaintDetail id={complaintId} />
      </div>
    </>
  );
}
