"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import StatusBadge from "../../../components/StatusBadge";
import RatingForm from "../../../components/RatingForm";
import AiSummary from "../insights/ai-summary";

export default function ComplaintList() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchComplaints = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/complaints", {
        params: { cursor, limit: 10 },
      });
      const newItems = res.data.data || [];
      setComplaints((prev) => [...prev, ...newItems]);
      setCursor(res.data.nextCursor);
      setHasMore(!!res.data.nextCursor);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold">Complaint Ledger</h2>
      <div className="flex flex-col gap-4">
        {complaints.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  {c.brand?.name || "Unknown Brand"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={c.status} />
            </div>

            <p className="text-sm mb-4 leading-relaxed">{c.description}</p>

            {c.aiSummary && <AiSummary summary={c.aiSummary} />}

            <div className="mt-6 border-t pt-4">
              <RatingForm complaintId={c.id} initialRating={c.rating} />
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="mt-4 p-3 rounded-xl border border-border bg-background hover:bg-muted font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? "Discovering more records..." : "Load More Activity"}
        </button>
      )}

      {!hasMore && complaints.length > 0 && (
        <p className="text-center text-muted-foreground mt-8 text-sm italic">
          You've reached the end of the ledger.
        </p>
      )}
    </div>
  );
}
