"use client";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { mockComplaints } from "../../utils/mockData";
import ComplaintCard from "../../components/ComplaintCard";
import ComplaintDetail from "../../components/ComplaintDetail";
import MetricsPanel from "../../components/MetricsPanel";
import ComplaintForm from "../../components/ComplaintForm";
import PublicHeader from "../../components/PublicHeader";
import InputField from "../../components/InputField";

type ComplaintFormData = {
  brandName: string;
  description: string;
  files: FileList;
};

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComplaintsContent />
    </Suspense>
  );
}

function ComplaintsContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // Search & Filter State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setSelectedId(id);
    }
  }, [searchParams]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "10");
      if (debouncedQuery) queryParams.append("q", debouncedQuery);
      if (statusFilter && statusFilter !== "ALL")
        queryParams.append("status", statusFilter);

      const res = await axios.get(
        `${apiUrl}/complaints/public/search?${queryParams.toString()}`,
      );
      setComplaints(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, debouncedQuery, statusFilter]);

  const handleSubmit = async (data: ComplaintFormData) => {
    if (!session?.accessToken) {
      alert("Please log in to submit a complaint");
      return;
    }

    console.log("[ComplaintsPage] Starting submission...");
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("brandName", data.brandName);
      formData.append("title", "Consumer Complaint");
      formData.append("description", data.description);

      if (data.files && data.files.length > 0) {
        console.log(`[ComplaintsPage] Appending ${data.files.length} files`);
        for (let i = 0; i < data.files.length; i++) {
          formData.append("attachments", data.files[i]);
        }
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      console.log(`[ComplaintsPage] Sending request to ${apiUrl}/complaints`);

      const response = await axios.post(`${apiUrl}/complaints`, formData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          // Let the browser set the boundary for multipart/form-data
        },
      });

      console.log("[ComplaintsPage] Submission successful:", response.data);
      alert("Complaint submitted successfully!");
      fetchComplaints(); // Refresh list
    } catch (error: any) {
      console.error(
        "[ComplaintsPage] Submission error:",
        error.response?.data || error.message,
      );
      alert("Failed to submit complaint");
    } finally {
      console.log("[ComplaintsPage] Submission finished.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <PublicHeader />

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header & Metrics */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Complaints Dashboard
            </h1>
            <p className="text-muted-foreground">
              Browse, filter, and track community complaints
            </p>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96">
            <InputField
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<span className="material-symbols-outlined">search</span>}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="flex w-full md:w-auto gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-12 px-4 rounded-xl border border-border bg-background outline-none transition-all cursor-pointer flex-1 md:w-48 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Submit Button for Consumers - Mobile/Tablet location */}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Latest Reports</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                Page {page} of {totalPages || 1}
              </span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-40 bg-card rounded-2xl border border-border animate-pulse"
                    />
                  ))}
                </div>
              ) : complaints.length === 0 ? (
                <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border text-muted-foreground">
                  No complaints found matching your criteria.
                </div>
              ) : (
                complaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    id={complaint.id}
                    brand={complaint.brand?.name || "Unknown Brand"}
                    brandLogoUrl={complaint.brand?.logoUrl}
                    isVerified={complaint.brand?.isVerified}
                    status={complaint.status}
                    description={complaint.description}
                    createdAt={complaint.createdAt}
                    onClick={setSelectedId}
                    isActive={selectedId === complaint.id} // Optional: highlight active
                  />
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="p-2 rounded-xl border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>

                {/* Simple page indicator */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Smart pagination logic simplified for now
                    let p = i + 1;
                    if (page > 3 && totalPages > 5) p = page - 2 + i;
                    if (p > totalPages) return null;

                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                          page === p
                            ? "bg-primary text-white shadow-lg shadow-primary/25"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="p-2 rounded-xl border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Detail View */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {selectedId ? (
              <ComplaintDetail id={selectedId} />
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-dashed border-border text-center h-[500px]">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl text-muted-foreground">
                    visibility
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Select a Complaint</h3>
                <p className="text-muted-foreground max-w-xs">
                  Click on any complaint from the list to view its full details,
                  attachments, and timeline.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
