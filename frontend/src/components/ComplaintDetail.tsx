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

      if (session?.accessToken && (session?.user as any)?.role !== "BRAND") {
        try {
          const ratingRes = await axios.get(`${apiUrl}/ratings/${id}/user`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });
          setExistingRating(ratingRes.data);
        } catch (error) {
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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {complaint.brand?.name || "Unknown Brand"}
                </h1>
                {complaint.brand?.isVerified && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
                    <BadgeCheck className="w-3 h-3 " />
                    Verified
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                  ID:{" "}
                  <span className="font-mono text-foreground/70">
                    #{complaint.id.slice(0, 8)}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-[150px]">
            <StatusBadge status={complaint.status} />
            {complaint.ratings?.find(
              (r: any) => r.userId === complaint.userId,
            ) && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full border border-border/50">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Rated
                </span>
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Action Toolbar (Brand Only) */}
      {isBrandUser && (
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
              />
            </div>
          )}
        </div>
      )}

      {/* 3. Main Body */}
      <div className="p-8 space-y-10">
        {/* Issue & AI Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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
          {complaint.aiSummary && (
            <div className="relative rounded-2xl overflow-hidden bg-primary/5 border border-primary/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm text-primary">
                    <span className="material-symbols-outlined text-lg animate-pulse">
                      auto_awesome
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    AI Intelligence
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                  Generated Insight
                </span>
              </div>
              <div className="italic text-sm text-foreground/80 leading-relaxed space-y-2">
                {complaint.aiSummary
                  .split("\n")
                  .map((line: string, i: number) => (
                    <p
                      key={i}
                      className={clsx(line.trim().startsWith("-") && "pl-4")}
                    >
                      {line}
                    </p>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div>
          <div className="flex items-center gap-2 border-b border-border pb-4 mb-6">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
              Resolution Timeline
            </h2>
          </div>

          <div className="space-y-6 max-w-3xl mx-auto">
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
              {session ? (
                <div className="bg-card rounded-2xl border border-border/60 shadow-lg shadow-primary/5 p-6 space-y-4">
                  {/* Logic for Input / Closed State */}
                  {isBrandUser &&
                  (complaint.status === "RESOLVED" ||
                    complaint.status === "REJECTED") ? (
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
                                color={complaint.brand?.widgetStyles?.starColor}
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
                                disabled={ratingSubmitting || userRating === 0}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetail;
