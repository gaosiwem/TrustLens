"use client";
import { useParams } from "next/navigation";
import ComplaintDetail from "../../../components/ComplaintDetail";
import PublicHeader from "../../../components/PublicHeader";
import { BadgeCheck } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ComplaintDetailsPage() {
  const params = useParams();
  const complaintId = params.id as string;
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background pb-20">
      <PublicHeader />
      <div className="max-w-4xl mx-auto space-y-6 pt-10 px-4 sm:px-6 md:px-8">
        {/* Complaint Detail Component */}
        <ComplaintDetail id={complaintId} />
      </div>
    </div>
  );
}
