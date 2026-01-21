"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import DarkModeToggle from "../../../components/DarkModeToggle";
import BrandLogo from "../../../components/BrandLogo";

import PublicHeader from "../../../components/PublicHeader";

export default function ReviewDetailPage() {
  const { id } = useParams();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReview() {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"
          }/complaints/${id}`
        );
        const data = await response.json();
        setReview(data);
      } catch (error) {
        console.error("Error fetching review:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchReview();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-4xl font-black mb-4">Review Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The review you are looking for does not exist or has been removed.
        </p>
        <Link href="/">
          <Button className="rounded-2xl font-bold px-8 h-12">
            Go Back Home
          </Button>
        </Link>
      </div>
    );
  }

  const userInitials = review.user?.name
    ? review.user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const formattedDate = new Date(review.createdAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const activeSince = review.user?.createdAt
    ? new Date(review.user.createdAt).toLocaleString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const stars = review.ratings?.[0]?.stars || 5;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Navigation */}
      <PublicHeader transparent={true} />

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* User Section */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary border-2 border-primary/20 text-xl tracking-tighter">
              {userInitials}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black tracking-tight">
                {review.user?.name || "Anonymous User"}
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                {review.user?._count?.complaints || 1} reviews | Active since{" "}
                {activeSince}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-sm mb-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 text-primary text-sm font-bold tracking-widest">
                <span className="material-symbols-outlined text-base">
                  schedule
                </span>
                {formattedDate}
              </div>
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`material-symbols-outlined ${
                      i < stars ? "fill-icon" : ""
                    }`}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black mb-6 leading-tight tracking-tight">
              {review.title}
            </h1>

            <div className="flex items-center gap-6 mb-10 py-4 px-8 bg-muted/50 rounded-2xl w-fit border border-border">
              <BrandLogo
                brandName={review.brand?.name}
                brandLogoUrl={review.brand?.logoUrl}
                className="w-20 h-20 rounded-xl object-contain bg-white border border-border shadow-sm"
              />
              <span className="font-bold text-xl tracking-tight">
                {review.brand?.name}
              </span>
            </div>

            <div className="text-lg leading-relaxed text-foreground/90 mb-12 space-y-4">
              {review.description
                .split("\n")
                .map((paragraph: string, i: number) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>

            <hr className="border-border mb-8" />

            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
                  reply
                </span>
                Reply ({review.followups?.length || 0})
              </button>

              <div className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-muted transition-colors">
                  <span className="material-symbols-outlined text-xl text-muted-foreground">
                    share
                  </span>
                </button>
                <button className="p-2 rounded-full hover:bg-muted transition-colors">
                  <span className="material-symbols-outlined text-xl text-muted-foreground">
                    flag
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Replies Section */}
          {review.followups && review.followups.length > 0 && (
            <div className="space-y-6 mb-12">
              <h3 className="text-xl font-black tracking-tight ml-4">
                Responses
              </h3>
              {review.followups.map((reply: any, i: number) => (
                <div
                  key={i}
                  className="bg-muted/30 border border-border rounded-3xl p-6 relative"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                      {reply.user?.name?.[0]?.toUpperCase() || "B"}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {reply.user?.name || "Brand Representative"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-black tracking-widest">
                        Official Response
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground/80 leading-relaxed italic">
                    "{reply.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Link href="/">
              <Button
                variant="outline"
                className="rounded-2xl font-bold px-8 border-2"
              >
                Back to Recent Reviews
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
