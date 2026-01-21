"use client";

import { useParams } from "next/navigation";
import ComplaintDetail from "../../../../components/ComplaintDetail";
import UserHeader from "../../../../components/dashboard/UserHeader";

export default function UserComplaintDetailsPage() {
  const params = useParams();
  const complaintId = params.id as string;

  return (
    <>
      <UserHeader
        title="Complaint Details"
        subtitle="View progress and updates on your complaint"
      />

      <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 sm:px-6 pt-10">
        <ComplaintDetail id={complaintId} />
      </div>
    </>
  );
}
