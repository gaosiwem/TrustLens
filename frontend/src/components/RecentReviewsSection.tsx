"use client";
import { useRef } from "react";
import { ReviewCard } from "./ReviewCard";

interface RecentReviewsSectionProps {
  recentReviews: any[];
}

export default function RecentReviewsSection({
  recentReviews,
}: RecentReviewsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (recentReviews.length === 0) {
    return (
      <div className="col-span-full text-center py-20 bg-background/50 rounded-[3rem] border border-dashed border-border">
        <span className="material-symbols-outlined text-6xl text-muted-foreground/30 mb-4 block">
          rate_review
        </span>
        <p className="text-muted-foreground font-medium text-lg">
          No recent reviews yet. Be the first to share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
            Recent <span className="text-primary italic">Reviews</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-md">
            Real-time feed of consumer experiences and brand resolutions across
            South Africa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-90 shadow-sm group"
            aria-label="Scroll Left"
          >
            <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">
              chevron_left
            </span>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-90 shadow-sm group"
            aria-label="Scroll Right"
          >
            <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {recentReviews.map((complaint: any) => {
            const brandReply = complaint.followups?.find(
              (f: any) => f.user?.role === "BRAND"
            );

            const ownerRating = complaint.ratings?.find(
              (r: any) => r.userId === complaint.userId
            );

            return (
              <div
                key={complaint.id}
                className="shrink-0 w-[280px] sm:w-[340px] snap-start"
              >
                <ReviewCard
                  id={ownerRating?.id || complaint.id}
                  complaintId={complaint.id}
                  userName={complaint.user?.name || "Anonymous User"}
                  userAvatar={
                    complaint.user?.name
                      ? complaint.user.name[0].toUpperCase()
                      : "U"
                  }
                  date={complaint.createdAt}
                  content={complaint.description}
                  brandName={complaint.brand?.name || "Unknown Brand"}
                  brandLogoUrl={complaint.brand?.logoUrl}
                  brandTrustScore={complaint.brand?.trustScore}
                  brandTotalComplaints={complaint.brand?.totalComplaints}
                  isVerified={complaint.brand?.isVerified}
                  verifiedUntil={complaint.brand?.subscription?.verifiedUntil}
                  stars={ownerRating?.stars}
                  latestReply={brandReply?.comment}
                />
              </div>
            );
          })}
        </div>

        {/* Faint Edge Fades */}
        <div className="absolute top-0 left-0 w-8 h-full bg-linear-to-r from-background to-transparent pointer-events-none opacity-50 sm:hidden" />
        <div className="absolute top-0 right-0 w-8 h-full bg-linear-to-l from-background to-transparent pointer-events-none opacity-50 sm:hidden" />
      </div>
    </div>
  );
}
