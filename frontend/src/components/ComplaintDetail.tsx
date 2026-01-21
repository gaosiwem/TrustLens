"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import AttachmentsPreview from "./AttachmentsPreview";
import BrandLogo from "./BrandLogo";
import StatusBadge from "./StatusBadge";
import clsx from "clsx";
import RatingStars from "./RatingStars";
import { BadgeCheck } from "lucide-react";

interface ComplaintDetailProps {
  id: string;
}

export function ComplaintDetail({ id }: ComplaintDetailProps) {
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const headers: any = {};
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      if (id === "new" || id === "create" || !id) {
        setLoading(false);
        return;
      }
      const res = await axios.get(`${apiUrl}/complaints/${id}`, { headers });
      setComplaint(res.data);

      // Fetch user's existing rating if logged in and not a brand user
      if (session?.accessToken && (session?.user as any)?.role !== "BRAND") {
        try {
          const ratingRes = await axios.get(`${apiUrl}/ratings/${id}/user`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });
          setExistingRating(ratingRes.data);
        } catch (error) {
          // No rating exists yet, which is fine
          setExistingRating(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch complaint detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id, session?.accessToken]);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim() || !session?.accessToken) return;
    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      await axios.post(
        `${apiUrl}/followups`,
        {
          complaintId: id,
          comment: response,
        },
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        },
      );
      setResponse("");
      await fetchComplaint(); // Refresh to show new response and status
      toast.success("Response submitted successfully!");
    } catch (error) {
      console.error("Failed to submit response:", error);
      toast.error("Failed to submit response.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) {
      toast.warning("Please select a rating");
      return;
    }
    setRatingSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      await axios.post(
        `${apiUrl}/ratings`,
        {
          complaintId: id,
          stars: userRating,
          comment: ratingComment || null,
        },
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );
      setUserRating(0);
      setRatingComment("");
      toast.success("Rating submitted successfully!");
      await fetchComplaint(); // Refresh to show updated data
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast.error("Failed to submit rating");
    } finally {
      setRatingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-card rounded-2xl border border-border shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex-1 p-6 bg-card rounded-2xl border border-border shadow-sm">
        <p className="text-muted-foreground">Complaint not found</p>
      </div>
    );
  }

  const isBrandUser = (session?.user as any)?.role === "BRAND";

  return (
    <div className="flex-1 p-6 bg-card rounded-2xl border border-border shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo
            brandName={complaint.brand?.name || "Brand"}
            brandLogoUrl={complaint.brand?.logoUrl}
            className="w-12 h-12 rounded-xl object-contain bg-white border border-border"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-2xl">
                {complaint.brand?.name || "Unknown Brand"}
              </h2>
              {complaint.brand?.isVerified && (
                <BadgeCheck className="w-6 h-6 text-white fill-primary" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Filed on {new Date(complaint.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground">
              Status
            </span>
            <StatusBadge status={complaint.status} />
          </div>
          {/* Public Consumer Rating */}
          {complaint.ratings?.find(
            (r: any) => r.userId === complaint.userId,
          ) && (
            <div className="flex flex-col items-end mt-1">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">
                Consumer Rating
              </span>
              <RatingStars
                max={5}
                initialRating={
                  complaint.ratings.find(
                    (r: any) => r.userId === complaint.userId,
                  ).stars
                }
                readOnly={true}
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-muted-foreground tracking-wider mb-2">
            Issue Description
          </h3>
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>
        </div>
        {complaint.aiSummary && (
          <div className="relative group">
            {/* Decorative background glow */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary/20 to-cyan-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-500 opacity-50" />

            <div className="relative overflow-hidden rounded-2xl bg-card border border-primary/20 shadow-sm transition-all duration-300 group-hover:shadow-md">
              {/* Subtle top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary/40 via-cyan-500/40 to-primary/40" />

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-base animate-pulse">
                        auto_awesome
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-tight uppercase italic text-primary">
                        AI Intelligent Summary
                      </h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                        Precision Content Generation
                      </p>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-primary/5 border border-primary/10">
                    <span className="text-[10px] font-black text-primary italic uppercase">
                      TrustLens Intelligence
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-3 -top-2 text-5xl text-primary/10 font-serif italic select-none">
                    "
                  </span>
                  <div className="text-sm leading-relaxed text-foreground/90 font-medium relative z-10 pl-4 pr-2 space-y-3">
                    {complaint.aiSummary
                      .split("\n")
                      .map((line: string, i: number) => (
                        <p
                          key={i}
                          className={clsx(
                            line.trim().startsWith("-") ||
                              line.trim().startsWith("•")
                              ? "pl-4 -indent-4"
                              : "",
                          )}
                        >
                          {line}
                        </p>
                      ))}
                  </div>
                  <span className="absolute -right-1 -bottom-3 text-5xl text-primary/10 font-serif italic select-none">
                    "
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-primary/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold italic tracking-tight">
                      Neutral AI Analysis • Precision Resolution Engine
                    </p>
                  </div>

                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse [animation-duration:2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse [animation-duration:2s] [animation-delay:0.5s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse [animation-duration:2s] [animation-delay:1s]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <AttachmentsPreview
          files={complaint.attachments?.map((a: any) => a.fileName) || []}
        />
      </div>

      {/* Conversation / Followups */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="text-sm font-bold text-muted-foreground tracking-wider">
          Resolution Timeline
        </h3>
        <div className="space-y-4">
          {complaint.followups?.length === 0 ? (
            <p className="text-sm italic text-muted-foreground bg-muted/20 p-4 rounded-xl text-center">
              No responses yet.
            </p>
          ) : (
            complaint.followups.map((f: any) => (
              <div
                key={f.id}
                className={clsx(
                  "p-4 rounded-2xl border",
                  f.user?.role === "BRAND"
                    ? "bg-primary/5 border-primary/20 ml-8"
                    : "bg-muted/30 border-border mr-8",
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold tracking-tight">
                    {f.user?.role === "BRAND"
                      ? complaint.brand?.name || "Brand"
                      : f.user?.name || "You"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(f.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {f.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Response and Rating Forms - Only for logged-in users */}
      {session ? (
        <>
          {/* Response Form for Brands */}
          {isBrandUser && (
            <>
              {complaint.status === "RESOLVED" ||
              complaint.status === "REJECTED" ? (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border text-center">
                    <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">
                      lock
                    </span>
                    <p className="text-sm font-semibold text-muted-foreground">
                      This complaint is {complaint.status.toLowerCase()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No further responses can be submitted
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmitResponse}
                  className="mt-6 pt-6 border-t border-border space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold tracking-wider">
                      Submit Official Response
                    </label>
                    <span className="text-[10px] text-muted-foreground italic">
                      AI response suggestion coming soon
                    </span>
                  </div>
                  <textarea
                    className="w-full border border-border rounded-2xl p-4 bg-background min-h-[150px] text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Type your official response to the customer..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    disabled={submitting}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !response.trim()}
                      className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? "Sending..." : "Send Response"}
                      <span className="material-symbols-outlined text-sm">
                        send
                      </span>
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Submitting a response will automatically update the
                    complaint status to <strong>RESPONDED</strong>.
                  </p>
                </form>
              )}
            </>
          )}

          {/* Consumer Response and Rating - Only if no rating submitted */}
          {!isBrandUser && !existingRating && (
            <>
              <form
                onSubmit={handleSubmitResponse}
                className="mt-6 pt-6 border-t border-border space-y-4"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold tracking-wider">
                    Reply to Brand
                  </label>
                </div>
                <textarea
                  className="w-full border border-border rounded-2xl p-4 bg-background min-h-[120px] text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Type your response or follow-up question..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  disabled={submitting}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !response.trim()}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? "Sending..." : "Send Reply"}
                    <span className="material-symbols-outlined text-sm">
                      send
                    </span>
                  </button>
                </div>
              </form>

              {/* Rating Section for Consumers */}
              <form
                onSubmit={handleSubmitRating}
                className="mt-6 pt-6 border-t border-border space-y-4"
              >
                <h3 className="text-sm font-bold tracking-wider">
                  Rate Brand Response
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold mb-2 block text-muted-foreground">
                      Your Rating
                    </label>
                    <RatingStars max={5} onChange={setUserRating} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-2 block text-muted-foreground">
                      Comment (Optional)
                    </label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Share your experience with the brand's response..."
                      className="w-full rounded-xl border border-border bg-background p-4 min-h-[80px] text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      disabled={ratingSubmitting}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={ratingSubmitting || userRating === 0}
                      className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {ratingSubmitting ? "Submitting..." : "Submit Rating"}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </>
      ) : (
        <div className="mt-8 p-8 rounded-4xl bg-primary/5 border border-dashed border-primary/20 text-center">
          <p className="text-muted-foreground mb-4">
            You must be signed in to join the conversation or leave a rating.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/login">
              <button className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm">
                Sign In
              </button>
            </Link>
            <Link href="/auth/register">
              <button className="px-6 py-2 variant-outline font-bold rounded-xl hover:bg-muted transition-all text-sm border border-border">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Display Submitted Rating */}
      {!isBrandUser && existingRating && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-bold tracking-wider mb-4">Your Rating</h3>
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <RatingStars
                max={5}
                initialRating={existingRating.stars}
                readOnly={true}
              />
              <span className="text-sm font-semibold">
                {existingRating.stars} out of 5 stars
              </span>
            </div>
            {existingRating.comment && (
              <p className="text-sm leading-relaxed mt-3 text-foreground/80">
                {existingRating.comment}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Submitted on{" "}
              {new Date(existingRating.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintDetail;
