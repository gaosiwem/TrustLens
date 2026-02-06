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
import {
  BadgeCheck,
  Calendar,
  Clock,
  Paperclip,
  MessageSquare,
  Shield,
  User,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  LayoutDashboard,
} from "lucide-react";
import StandardLoader from "./StandardLoader";
import { SLATimer } from "./brand/SLATimer";
import { AssigneeSelect } from "./brand/AssigneeSelect";

interface ComplaintDetailProps {
  id: string;
  readonly?: boolean;
  initialData?: any;
}

// Simple session cache to avoid refetching the same complaint multiple times
const complaintCache: Record<string, any> = {};

export function ComplaintDetail({
  id,
  readonly = false,
  initialData,
}: ComplaintDetailProps) {
  const [complaint, setComplaint] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [currentId, setCurrentId] = useState(id);
  const { data: session } = useSession();

  const [existingRating, setExistingRating] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // Reset state instantly when ID changes to prevent showing stale data
  if (id !== currentId) {
    setCurrentId(id);
    const cached = complaintCache[id];
    setComplaint(cached || initialData || null);
    setLoading(!cached && !initialData);
    setExistingRating(null); // Clear rating from previous complaint
  }

  const fetchComplaint = async () => {
    if (id === "new" || id === "create" || !id) {
      setLoading(false);
      return;
    }

    // Check cache first (contains the full object)
    if (complaintCache[id]) {
      setComplaint(complaintCache[id]);
      setLoading(false);
      // We still run the fetch in background to refresh, but UI is already ready
    } else if (!complaint && !initialData) {
      setLoading(true);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const headers: any = {};
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      // Parallelize both requests
      const requests: Promise<any>[] = [
        axios.get(`${apiUrl}/complaints/${id}`, { headers }),
      ];

      const [complaintRes] = await Promise.all(requests);

      const updatedComplaint = complaintRes.data;
      setComplaint(updatedComplaint);
      complaintCache[id] = updatedComplaint; // Update cache

      // Calculate existing rating from the complaint object directly
      if (session?.user && (session.user as any).role !== "BRAND") {
        const foundRating = updatedComplaint.ratings?.find(
          (r: any) => r.userId === (session.user as any).id,
        );
        setExistingRating(foundRating || null);
      }
    } catch (error) {
      console.error("Failed to fetch complaint detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setComplaint(initialData);
      setLoading(false);
    }
  }, [initialData, id]);

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
      await fetchComplaint();
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
      await fetchComplaint();
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast.error("Failed to submit rating");
    } finally {
      setRatingSubmitting(false);
    }
  };

  if (loading) {
    return <StandardLoader />;
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
    <div className="bg-card rounded-3xl border border-border shadow-sm flex flex-col">
      {/* 1. Header Section */}
      <div className="p-8 border-b border-border relative overflow-hidden">
        {/* Subtle bg wash */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-6">
            <BrandLogo
              brandName={complaint.brand?.name || "Brand"}
              brandLogoUrl={complaint.brand?.logoUrl}
              className="w-20 h-20 rounded-2xl object-contain bg-white border border-border/50 shadow-sm grow-0 shrink-0"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {complaint.brand?.name || "Unknown Brand"}
                </h1>
                {complaint.brand?.isVerified && (
                  <BadgeCheck className="w-5 h-5 text-white fill-primary" />
                )}
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-[150px]">
            <StatusBadge status={complaint.status} />
          </div>
        </div>
      </div>

      {/* 2. Action Toolbar (Brand Only) */}
      {!readonly && isBrandUser && (
        <div className="bg-muted/30 border-b border-border px-8 py-4 flex flex-wrap items-center gap-8 shadow-inner rounded-b-3xl sm:rounded-none z-20 relative">
          <AssigneeSelect
            complaintId={complaint.id}
            brandId={complaint.brandId}
            currentAssigneeId={complaint.assignedToId}
          />

          {/* SLA Timer */}
          {complaint.slaDeadline && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                SLA Time Remaining
              </span>
              <SLATimer
                deadline={complaint.slaDeadline}
                status={complaint.slaStatus}
                restricted={
                  /* Check if any active subscription has teamSLA: true */
                  !complaint.brand?.subscriptions?.some(
                    (sub: any) =>
                      sub.status === "ACTIVE" && sub.plan?.features?.teamSLA,
                  )
                }
              />
            </div>
          )}
        </div>
      )}

      {/* 3. Main Body */}
      <div className="p-8 space-y-10">
        {/* Issue & AI Grid */}
        <div
          className={clsx(
            "grid grid-cols-1 gap-10",
            !readonly && complaint.aiSummary && "lg:grid-cols-2",
          )}
        >
          {/* Left: Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <AlertCircle className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                Complaint Details
              </h2>
            </div>
            <div className="prose prose-sm max-w-none text-foreground leading-loose whitespace-pre-wrap">
              {complaint.description}
            </div>

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-4">
                <h3 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5" /> Attachments
                </h3>
                <AttachmentsPreview
                  files={complaint.attachments.map((a: any) => a.fileName)}
                />
              </div>
            )}
          </div>

          {/* Right: AI Analysis */}
          {!readonly && complaint.aiSummary && (
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm text-primary ring-1 ring-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 animate-pulse"
                    >
                      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                      <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
                      <path d="M19 11h2m-1 -1v2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      AI Analysis
                    </h3>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Smart Insights
                    </p>
                  </div>
                </div>
                <div className="px-2 py-1 rounded bg-white/50 border border-primary/10 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-primary">
                    TRUST LENS
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {complaint.aiSummary
                  .split("\n")
                  .filter(Boolean)
                  .map((line: string, i: number) => {
                    const formatLine = (text: string) => {
                      const parts = text.split(/(\*\*.*?\*\*)/g);
                      return parts.map((part, index) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return (
                            <strong
                              key={index}
                              className="font-bold text-foreground"
                            >
                              {part.slice(2, -2)}
                            </strong>
                          );
                        }
                        return part;
                      });
                    };

                    if (line.trim().startsWith("-")) {
                      return (
                        <div key={i} className="flex gap-3 items-start group">
                          <div className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-primary/60 group-hover:bg-primary transition-colors" />
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {formatLine(line.replace(/^-/, "").trim())}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p
                        key={i}
                        className="text-sm text-foreground/90 font-medium leading-relaxed pb-2 border-b border-primary/5 last:border-0 last:pb-0"
                      >
                        {formatLine(line)}
                      </p>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div>
          <div className="flex items-center gap-2 border-b border-border pb-4 mb-6">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold tracking-widest text-muted-foreground">
              Resolution Timeline
            </h2>
          </div>

          <div className="space-y-6">
            {complaint.followups?.length === 0 && (
              <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border mb-8">
                <p className="text-sm text-muted-foreground">
                  No responses yet.
                </p>
              </div>
            )}

            {complaint.followups?.map((f: any) => (
              <div
                key={f.id}
                className={clsx(
                  "flex gap-5",
                  f.user?.role === "BRAND" ? "flex-row-reverse" : "",
                )}
              >
                <div
                  className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border z-10 shadow-sm",
                    f.user?.role === "BRAND"
                      ? "bg-card border-primary text-primary"
                      : "bg-card border-border text-muted-foreground",
                  )}
                >
                  {f.user?.role === "BRAND" ? (
                    <Shield className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={clsx(
                    "flex-1 p-5 rounded-2xl shadow-sm border text-sm leading-relaxed whitespace-pre-wrap relative",
                    f.user?.role === "BRAND"
                      ? "bg-primary/5 border-primary/20 rounded-tr-none text-foreground"
                      : "bg-white border-border rounded-tl-none text-muted-foreground",
                  )}
                >
                  <div className="flex justify-between items-center mb-2 opacity-70">
                    <span className="font-bold text-xs uppercase tracking-wide">
                      {f.user?.role === "BRAND"
                        ? complaint.brand?.name
                        : f.user?.name}
                    </span>
                    <span className="text-[10px] mono">
                      {new Date(f.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {f.comment}
                </div>
              </div>
            ))}

            {/* Editor Area */}
            <div className="pt-6">
              {!readonly &&
                (session ? (
                  <div className="bg-card rounded-2xl border border-border/60 shadow-lg shadow-primary/5 p-6 space-y-4">
                    {/* Logic for Input / Closed State */}
                    {complaint.status === "RESOLVED" ||
                    complaint.status === "REJECTED" ? (
                      <div className="text-center p-4 bg-muted/20 rounded-xl text-sm text-muted-foreground">
                        Ticket is closed.
                      </div>
                    ) : (
                      <>
                        <form
                          onSubmit={
                            !isBrandUser && !existingRating
                              ? handleSubmitResponse
                              : isBrandUser
                                ? handleSubmitResponse
                                : (e) => e.preventDefault()
                          }
                        >
                          {(!existingRating || isBrandUser) && (
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <label className="text-sm font-bold text-foreground">
                                  {isBrandUser
                                    ? "Official Response"
                                    : "Your Reply"}
                                </label>
                              </div>
                              <textarea
                                className="w-full border border-border rounded-xl p-4 bg-muted/10 min-h-[120px] text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder="Type here..."
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                disabled={submitting}
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={handleSubmitResponse}
                                  disabled={submitting || !response.trim()}
                                  className="btn-base btn-primary px-6 py-2 rounded-xl flex items-center gap-2"
                                >
                                  {submitting ? "Sending..." : "Send"}
                                  <span className="material-symbols-outlined text-sm">
                                    send
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
                        </form>

                        {/* Consumer Rating Form */}
                        {!isBrandUser && !existingRating && (
                          <div className="mt-8 pt-8 border-t border-border/50">
                            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />{" "}
                                Mark as Resolved
                              </h3>
                              <form
                                onSubmit={handleSubmitRating}
                                className="space-y-4"
                              >
                                <RatingStars
                                  max={5}
                                  onChange={setUserRating}
                                  color={
                                    complaint.brand?.widgetStyles?.starColor
                                  }
                                />
                                <textarea
                                  value={ratingComment}
                                  onChange={(e) =>
                                    setRatingComment(e.target.value)
                                  }
                                  placeholder="Optional feedback..."
                                  className="w-full rounded-xl border border-border bg-white p-3 text-sm focus:border-primary outline-none"
                                />
                                <button
                                  type="submit"
                                  disabled={
                                    ratingSubmitting || userRating === 0
                                  }
                                  className="w-full btn-base btn-primary rounded-xl py-3 font-bold"
                                >
                                  {ratingSubmitting
                                    ? "Submitting..."
                                    : "Submit Rating & Close"}
                                </button>
                              </form>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-border rounded-2xl">
                    <Link
                      href="/auth/login"
                      className="text-primary font-bold hover:underline"
                    >
                      Sign In needed
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Consumer Rating Display (After Timeline) */}
        {complaint.ratings?.find((r: any) => r.userId === complaint.userId) && (
          <div className="mt-8 pt-8 border-t border-border">
            <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    User Feedback
                  </h3>
                  <div className="flex items-center gap-2">
                    <RatingStars
                      max={5}
                      initialRating={
                        complaint.ratings.find(
                          (r: any) => r.userId === complaint.userId,
                        ).stars
                      }
                      readOnly={true}
                      size="sm"
                      color={complaint.brand?.widgetStyles?.starColor}
                    />
                    <span className="text-xs text-muted-foreground">Rated</span>
                  </div>
                </div>
              </div>
              {complaint.ratings.find((r: any) => r.userId === complaint.userId)
                .comment && (
                <div className="text-sm text-foreground/80 italic pl-11">
                  "
                  {
                    complaint.ratings.find(
                      (r: any) => r.userId === complaint.userId,
                    ).comment
                  }
                  "
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintDetail;
