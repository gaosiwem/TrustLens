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
  const [brandName, setBrandName] = useState<string>("");
  const [starColor, setStarColor] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch complaint details to get the brand name
  useState(() => {
    const fetchComplaint = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/complaints/${id}`,
        );
        if (response.ok) {
          const data = await response.json();
          // Assuming the API returns the complaint object with a brand relation
          if (data && data.brand && data.brand.name) {
            setBrandName(data.brand.name);
            if (data.brand.widgetStyles?.starColor) {
              setStarColor(data.brand.widgetStyles.starColor);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch complaint details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComplaint();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <SideDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">
          Rate Complaint {brandName ? `for ${brandName}` : ""}
        </h2>
        <div className="bg-white dark:bg-[#101d22] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            How was your experience with the resolution of this complaint?
          </p>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <RatingForm
              complaintId={id}
              brandName={brandName}
              starColor={starColor}
            />
          )}
        </div>
      </main>
    </div>
  );
}
