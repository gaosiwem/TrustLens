"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(
    () => searchParams.get("category") || "",
  );
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastRequestRef = useRef<number>(0);
  const { data: session } = useSession();

  // Search & Filter State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const cat = searchParams.get("category") || "";
    if (cat !== category) {
      setCategory(cat);
      setPage(1);
    }
  }, [searchParams, category]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchComplaints = async () => {
    const requestId = ++lastRequestRef.current;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "10");
      if (debouncedQuery) queryParams.append("q", debouncedQuery);
      if (statusFilter && statusFilter !== "ALL")
        queryParams.append("status", statusFilter);
      if (category) queryParams.append("category", category);
      if (ratingFilter) queryParams.append("rating", ratingFilter);

      const res = await axios.get(
        `${apiUrl}/complaints/public/search?${queryParams.toString()}`,
      );
      if (requestId !== lastRequestRef.current) return;
      setComplaints(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      if (requestId === lastRequestRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, debouncedQuery, statusFilter, category, ratingFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <PublicHeader />

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
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

            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              className="h-12 px-4 rounded-xl border border-border bg-background outline-none transition-all cursor-pointer flex-1 md:w-48 appearance-none"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* List Layout */}
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
                  verifiedUntil={complaint.brand?.subscription?.endsAt}
                  status={complaint.status}
                  description={complaint.description}
                  createdAt={complaint.createdAt}
                  onClick={(id) => router.push(`/complaints/${id}`)}
                  ratings={complaint.ratings}
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
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {/* Simple page indicator */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
