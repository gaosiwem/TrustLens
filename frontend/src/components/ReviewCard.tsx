import { useState, useEffect } from "react";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import BrandLogo from "./BrandLogo";
import RatingStars from "./RatingStars";

interface ReviewCardProps {
  id: string; // Rating ID
  complaintId: string; // For navigation
  userName: string;
  userAvatar: string;
  date: string;
  content: string;
  brandName: string;
  brandLogoUrl?: string;
  brandTrustScore?: number;
  brandTotalComplaints?: number;
  isVerified?: boolean;
  verifiedUntil?: string | null;
  stars?: number;
  latestReply?: string;
}

export function ReviewCard({
  id,
  complaintId,
  userName: propUserName,
  userAvatar: propUserAvatar,
  date: propDate,
  content: propContent,
  brandName: propBrandName,
  brandLogoUrl: propBrandLogoUrl,
  brandTrustScore: propBrandTrustScore,
  brandTotalComplaints: propBrandTotalComplaints,
  isVerified: propIsVerified,
  verifiedUntil: propVerifiedUntil,
  stars: propStars,
  latestReply: propLatestReply,
}: ReviewCardProps) {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(!propStars && !!complaintId);

  useEffect(() => {
    async function fetchReview() {
      if (!complaintId) return;
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const response = await fetch(`${apiUrl}/complaints/${complaintId}`);
        const data = await response.json();

        // The "correct" rating is the one from the complaint owner
        const ownerRating = data.ratings?.find(
          (r: any) => r.userId === data.userId,
        );
        const brandReply = data.followups?.find(
          (f: any) => f.user?.role === "BRAND",
        );

        setDbData({
          stars: ownerRating?.stars ?? 0,
          content: data.description, // User specifically asked for ORIGINAL description
          userName: data.user?.name ?? "Anonymous User",
          userAvatar: data.user?.name ? data.user.name[0].toUpperCase() : "U",
          date: ownerRating?.createdAt ?? data.createdAt,
          brandName: data.brand?.name ?? "Unknown Brand",
          brandLogoUrl: data.brand?.logoUrl,
          isVerified: data.brand?.isVerified,
          verifiedUntil: data.brand?.subscription?.verifiedUntil,
          latestReply: brandReply?.comment,
        });
      } catch (error) {
        console.error("Error fetching review:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReview();
  }, [complaintId]);

  const stars = dbData?.stars ?? propStars ?? 0;
  const content = dbData?.content ?? propContent ?? "";

  // Prioritize props for names unless they are placeholders, then use DB data
  const userName =
    propUserName && propUserName !== "Anonymous User"
      ? propUserName
      : dbData?.userName || "Anonymous User";

  const brandName =
    propBrandName && propBrandName !== "Unknown Brand"
      ? propBrandName
      : dbData?.brandName || "Unknown Brand";

  const userAvatar =
    userName !== "Anonymous User"
      ? userName[0].toUpperCase()
      : propUserAvatar || "U";

  const date = dbData?.date ?? propDate;
  const brandLogoUrl = propBrandLogoUrl || dbData?.brandLogoUrl;
  const latestReply = propLatestReply || dbData?.latestReply;
  const brandTrustScore = propBrandTrustScore ?? dbData?.brandTrustScore;
  const brandTotalComplaints =
    propBrandTotalComplaints ?? dbData?.brandTotalComplaints;
  const isVerified = propIsVerified ?? dbData?.isVerified;
  const verifiedUntil = propVerifiedUntil ?? dbData?.verifiedUntil;

  if (loading) {
    // ... loading state remains same
    return (
      <div className="p-6 rounded-3xl bg-background border border-border animate-pulse flex flex-col gap-4 h-[350px]">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        </div>
        <div className="h-6 w-40 bg-muted rounded mt-4" />
        <div className="space-y-2 mt-4">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-4xl bg-card border border-border flex flex-col justify-between hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group/card">
      <div>
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 text-base">
              {userAvatar}
            </div>
            <div>
              <h4 className="font-bold text-[13px]">{userName}</h4>
              <p className="text-[9px] text-muted-foreground tracking-widest font-bold">
                Verified Consumer
              </p>
            </div>
          </div>
          <RatingStars max={5} initialRating={stars} readOnly={true} />
        </div>

        <div className="flex items-center gap-3 mb-5">
          <BrandLogo
            brandName={brandName}
            brandLogoUrl={brandLogoUrl}
            className="w-10 h-10 rounded-lg object-contain bg-white shadow-sm p-1"
          />
          <div className="flex flex-col grow">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-[0.15em] text-muted-foreground/70">
                {brandName}
              </span>
              {isVerified && (
                <BadgeCheck className="w-4 h-4 text-white fill-primary ml-1" />
              )}
            </div>
            {/* {brandTrustScore !== undefined && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-bold text-muted-foreground">
                  {brandTotalComplaints} Complaints
                </span>
              </div>
            )} */}
          </div>
        </div>

        <p className="text-foreground/90 leading-relaxed mb-6 line-clamp-4 text-[14px] font-medium italic relative">
          <span className="absolute -left-3 -top-1 text-3xl text-primary/10 font-serif">
            "
          </span>
          {content.length > 180 ? `${content.substring(0, 180)}...` : content}
          <span className="absolute -bottom-5 text-3xl text-primary/10 font-serif">
            "
          </span>
        </p>

        {latestReply && (
          <div className="mb-5 p-4 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group/reply">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover/reply:bg-primary/10 transition-colors" />
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-white">
                  check_circle
                </span>
              </div>
              <span className="text-[10px] font-black tracking-widest text-primary">
                Official Brand Response
              </span>
            </div>
            <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
              {latestReply}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[10px] text-muted-foreground font-bold tracking-widest">
          {new Date(date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <Link href={`/complaints/${complaintId}`}>
          <Button
            variant="ghost"
            size="sm"
            className="font-bold text-primary hover:bg-primary/5 rounded-xl"
          >
            Read More
            <span className="material-symbols-outlined text-sm ml-1">
              arrow_forward
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
