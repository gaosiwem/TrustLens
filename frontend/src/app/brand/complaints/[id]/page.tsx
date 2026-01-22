"use client";

import { useParams, useRouter } from "next/navigation";
import ComplaintDetail from "../../../../components/ComplaintDetail";
import BrandHeader from "../../../../components/brand/BrandHeader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ComplaintSentimentPanel } from "./_components/ComplaintSentimentPanel";

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

      <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-10 px-4 sm:px-6">
        <ComplaintSentimentPanel complaintId={complaintId} />
        <ComplaintDetail id={complaintId} />
      </div>
    </>
  );
}
