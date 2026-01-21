"use client";

import { useParams } from "next/navigation";
import RatingForm from "../../../../components/RatingForm";
import Header from "../../../../components/Header";
import SideDrawer from "../../../../components/SideDrawer";
import { useState } from "react";

export default function RatingPage() {
  const params = useParams();
  const id = params.id as string;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <SideDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">
          Rate Complaint
        </h2>
        <div className="bg-white dark:bg-[#101d22] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            How was your experience with the resolution of this complaint?
          </p>
          <RatingForm complaintId={id} />
        </div>
      </main>
    </div>
  );
}
