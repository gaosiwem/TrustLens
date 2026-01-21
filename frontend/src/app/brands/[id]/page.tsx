"use client";
import { useState, useEffect, useRef } from "react";
import { BadgeCheck, Globe, Star, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { getAssetUrl } from "../../../lib/utils";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import RatingStars from "../../../components/RatingStars";
import { ReviewCard } from "../../../components/ReviewCard";
import PublicHeader from "../../../components/PublicHeader";
import { useSession } from "next-auth/react";

interface BrandProfile {
  id: string;
  name: string;
  logoUrl?: string;
  isVerified: boolean;
  createdAt: string;
  description?: string;
  websiteUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  searchTags: string[];
  stats: {
    averageRating: number; // This is the Bayesian TrustScore
    arithmeticAverage: number;
    totalRatings: number;
    totalComplaints: number;
    ratingDistribution: number[];
  };
  subscription?: {
    status: string;
    verifiedUntil?: string | null;
  };
  complaints: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function BrandProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStars, setFilterStars] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterReplied, setFilterReplied] = useState<boolean | undefined>(
    undefined,
  );
  const [filterVerified, setFilterVerified] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Handle search debounce and star detection
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim().toLowerCase();

      // Star detection heuristic: "5", "5 star", "5stars"
      const starMatch =
        trimmed.match(/^([1-5])\s*stars?$/) || trimmed.match(/^([1-5])$/);

      if (starMatch) {
        const starNum = parseInt(starMatch[1]);
        if (!filterStars.includes(starNum)) {
          setFilterStars((prev) => [...prev, starNum]);
        }
        setSearchQuery(""); // Clear search bar once directed to filter
        setDebouncedSearch("");
      } else {
        setDebouncedSearch(searchQuery);
      }
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        let url = `${apiUrl}/brands/public/${id}?page=${currentPage}&limit=6&sortBy=${sortBy}`;
        if (filterStars.length > 0) url += `&stars=${filterStars.join(",")}`;
        if (debouncedSearch)
          url += `&search=${encodeURIComponent(debouncedSearch)}`;
        if (filterReplied !== undefined) url += `&replied=${filterReplied}`;
        if (filterVerified) url += `&verified=true`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch brand profile:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProfile();
  }, [
    id,
    session,
    currentPage,
    filterStars,
    debouncedSearch,
    sortBy,
    filterReplied,
    filterVerified,
  ]);

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black mb-4">Brand not found</h1>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pagination = (profile as any)?.pagination;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PublicHeader />

      {/* Hero Section */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] bg-background border-muted overflow-hidden flex items-center justify-center shadow-lg">
                {profile?.logoUrl ? (
                  <img
                    src={getAssetUrl(profile.logoUrl)}
                    alt={profile.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <span className="text-4xl font-black text-muted-foreground/30">
                    {profile?.name[0]}
                  </span>
                )}
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <h1 className="text-3xl lg:text-5xl font-black tracking-tighter">
                    {profile?.name}
                  </h1>
                  {profile?.isVerified && (
                    <BadgeCheck className="w-8 h-8 text-white fill-primary ml-2" />
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <RatingStars
                          max={5}
                          initialRating={profile?.stats.averageRating || 0}
                          readOnly={true}
                        />
                        <span className="text-2xl font-black text-primary">
                          {profile?.stats.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          TrustScore™
                        </span>
                        {profile?.stats?.totalRatings !== undefined &&
                          profile.stats.totalRatings < 10 && (
                            <span className="text-[9px] font-bold text-muted-foreground italic">
                              (Damped by sample size)
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-border hidden sm:block"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black tracking-widest text-foreground">
                      {profile?.stats?.totalRatings} Reviews
                    </span>
                    <span className="text-[9px] text-muted-foreground font-bold tracking-widest">
                      Raw Avg: {profile?.stats?.arithmeticAverage?.toFixed(1)} ★
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
              <Link
                href={`/complaints?brand=${profile?.name}`}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-[200px] h-14 rounded-2xl font-bold bg-primary text-white shadow-xl shadow-primary/20"
                >
                  Write a Review
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 rounded-2xl font-bold border-2"
                onClick={() => {
                  if (profile?.websiteUrl) {
                    const url = profile.websiteUrl.startsWith("http")
                      ? profile.websiteUrl
                      : `https://${profile.websiteUrl}`;
                    window.open(url, "_blank");
                  }
                }}
              >
                Visit Website
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Main Feed */}
          <section className="space-y-12">
            {/* AI Summary Section */}
            <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl transition-colors group-hover:bg-primary/10 duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-white text-xl">
                      auto_awesome
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">
                    AI Resolution Intelligence
                  </h3>
                </div>
                <p className="text-foreground/80 leading-relaxed text-lg italic">
                  "Based on recent interactions, {profile?.name} shows a strong
                  commitment to resolution, particularly in their service
                  sector. Customers often highlight their efficient followup
                  process."
                </p>
              </div>
            </div>

            {/* Filter Tabs Header */}
            <div className="space-y-6" ref={reviewsRef}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black tracking-tight">
                    {filterStars.length > 0
                      ? `${filterStars.sort().join(", ")} Star Reviews`
                      : "All Reviews"}
                  </h2>
                  {(filterStars.length > 0 ||
                    debouncedSearch ||
                    filterReplied !== undefined ||
                    filterVerified) && (
                    <button
                      onClick={() => {
                        setFilterStars([]);
                        setSearchQuery("");
                        setFilterReplied(undefined);
                        setFilterVerified(false);
                        setCurrentPage(1);
                      }}
                      className="text-xs font-bold text-primary hover:underline tracking-tighter"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={sortBy === "createdAt" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSortBy("createdAt")}
                    className={`font-bold text-xs tracking-widest ${
                      sortBy === "createdAt"
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    Recent
                  </Button>
                  <Button
                    variant={sortBy === "verifiedTier" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSortBy("verifiedTier")}
                    className={`font-bold text-xs tracking-widest ${
                      sortBy === "verifiedTier"
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    Helpful
                  </Button>
                </div>
              </div>

              {/* Specific Filter Pills */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-muted/40 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => {
                      setFilterReplied(undefined);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                      filterReplied === undefined
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => {
                      setFilterReplied(true);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                      filterReplied === true
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Replied
                  </button>
                  <button
                    onClick={() => {
                      setFilterReplied(false);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                      filterReplied === false
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Unreplied
                  </button>
                </div>

                <div className="h-6 w-px bg-border mx-2"></div>

                <button
                  onClick={() => {
                    setFilterVerified(!filterVerified);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all border-2 ${
                    filterVerified
                      ? "border-primary/20 bg-primary/5 text-primary shadow-lg shadow-primary/5"
                      : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-sm ${
                      filterVerified ? "variation-fill" : ""
                    }`}
                  >
                    verified
                  </span>
                  Verified Only
                </button>

                <div className="h-6 w-px bg-border mx-2"></div>

                {/* Star Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        const newStars = filterStars.includes(s)
                          ? filterStars.filter((x) => x !== s)
                          : [...filterStars, s];
                        setFilterStars(newStars);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all border-2 shrink-0 ${
                        filterStars.includes(s)
                          ? "border-primary/20 bg-primary/5 text-primary shadow-lg shadow-primary/5"
                          : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      {s}
                      <span
                        className={`material-symbols-outlined text-xs variation-fill text-yellow-400`}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                  search
                </span>
                <input
                  type="text"
                  placeholder={`Search reviews for ${profile?.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setDebouncedSearch(searchQuery);
                    }
                  }}
                  className="w-full h-14 pl-12 pr-28 bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl outline-none font-bold transition-all text-sm placeholder:text-muted-foreground/50"
                />
                <div className="absolute right-2 flex items-center gap-2">
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setDebouncedSearch("");
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        close
                      </span>
                    </button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => setDebouncedSearch(searchQuery)}
                    className="h-10 rounded-xl px-4 font-black text-[10px] tracking-widest shadow-md"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Review Grid */}
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[2.5rem]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {profile?.complaints.map((complaint) => {
                  const ownerRating = complaint.ratings.find(
                    (r: any) => r.userId === complaint.userId,
                  );
                  const brandReply = complaint.followups.find(
                    (f: any) =>
                      f.user &&
                      (f.user.role === "BRAND" || f.user.role === "ADMIN"),
                  );

                  return (
                    <ReviewCard
                      key={complaint.id}
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
                      brandName={profile?.name || "Unknown Brand"}
                      brandLogoUrl={profile?.logoUrl}
                      brandTrustScore={profile?.stats.averageRating}
                      brandTotalComplaints={profile?.stats.totalComplaints}
                      isVerified={profile?.isVerified}
                      verifiedUntil={profile?.subscription?.verifiedUntil}
                      stars={ownerRating?.stars}
                      latestReply={brandReply?.comment}
                    />
                  );
                })}
                {profile?.complaints.length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted-foreground font-medium bg-muted/20 rounded-[2.5rem] border border-dashed border-border">
                    <span className="material-symbols-outlined text-4xl mb-4 block opacity-20">
                      rate_review
                    </span>
                    No reviews found matching your criteria.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1 || loading}
                    onClick={() => {
                      setCurrentPage((p) => p - 1);
                      reviewsRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="rounded-xl font-bold border-2"
                  >
                    <span className="material-symbols-outlined mr-2">
                      chevron_left
                    </span>
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const p = i + 1;
                      if (
                        p === 1 ||
                        p === pagination.totalPages ||
                        (p >= currentPage - 1 && p <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              setCurrentPage(p);
                              reviewsRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            }}
                            disabled={loading}
                            className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                              currentPage === p
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === currentPage - 2 || p === currentPage + 2) {
                        return (
                          <span key={p} className="text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    disabled={currentPage === pagination.totalPages || loading}
                    onClick={() => {
                      setCurrentPage((p) => p + 1);
                      reviewsRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="rounded-xl font-bold border-2"
                  >
                    Next
                    <span className="material-symbols-outlined ml-2">
                      chevron_right
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Rating Distribution */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border">
              <h3 className="text-lg font-black mb-8 tracking-tight">
                Company activity
              </h3>
              <div className="space-y-4">
                {profile?.stats.ratingDistribution.map((count, i) => {
                  const stars = 5 - i;
                  const percentage =
                    profile.stats.totalRatings > 0
                      ? (count / profile.stats.totalRatings) * 100
                      : 0;
                  const isActive = filterStars.includes(stars);

                  return (
                    <button
                      key={stars}
                      onClick={() => {
                        const newStars = filterStars.includes(stars)
                          ? filterStars.filter((x) => x !== stars)
                          : [...filterStars, stars];
                        setFilterStars(newStars);
                        setCurrentPage(1);
                      }}
                      className={`w-full flex items-center gap-4 group transition-all p-2 rounded-2xl hover:bg-muted/50 ${
                        isActive ? "bg-primary/5 ring-1 ring-primary/20" : ""
                      }`}
                    >
                      <span
                        className={`text-xs font-bold w-12 transition-colors ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary"
                        }`}
                      >
                        {stars} Star
                      </span>
                      <div className="grow h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${
                            isActive
                              ? "bg-primary"
                              : "bg-primary/60 group-hover:bg-primary"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-black w-8 text-right transition-colors ${
                          isActive ? "text-primary" : "text-muted-foreground/60"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* About Card */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-sm">
              <h3 className="text-lg font-black mb-6 tracking-tight">
                About {profile?.name}
              </h3>
              <div className="space-y-6">
                {profile?.description ? (
                  <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                    {profile.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No description provided by the brand.
                  </p>
                )}

                <div className="pt-4 border-t border-border space-y-4">
                  {profile?.supportPhone && (
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">
                          call
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        {profile.supportPhone}
                      </span>
                    </div>
                  )}
                  {profile?.supportEmail && (
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">
                          mail
                        </span>
                      </div>
                      <span className="text-sm font-bold truncate max-w-[200px]">
                        {profile.supportEmail}
                      </span>
                    </div>
                  )}
                  {profile?.websiteUrl ? (
                    <a
                      href={
                        profile.websiteUrl.startsWith("http")
                          ? profile.websiteUrl
                          : `https://${profile.websiteUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">
                          language
                        </span>
                      </div>
                      <span className="text-sm font-bold truncate hover:text-primary transition-colors">
                        {profile.websiteUrl.replace(/^https?:\/\//, "")}
                      </span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 opacity-50">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">
                          language
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        No website linked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Platform Insights / Guidelines */}
            <div className="p-8 rounded-[2.5rem] bg-background border border-border">
              <h4 className="text-[10px] font-black tracking-[0.25em] text-muted-foreground mb-6">
                About TrustLens
              </h4>
              <nav className="space-y-4">
                {[
                  { text: "Tips for writing helpful reviews", icon: "info" },
                  { text: "Avoid having your review removed", icon: "warning" },
                  { text: "How we combat fake reviews", icon: "security" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className="flex items-center justify-between w-full group text-left"
                  >
                    <span className="text-sm font-bold group-hover:text-primary transition-colors">
                      {item.text}
                    </span>
                    <span className="material-symbols-outlined text-lg text-muted-foreground group-hover:text-primary transition-colors">
                      {item.icon}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Popular Keywords */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border">
              <h4 className="text-lg font-black mb-6 tracking-tight">
                Popular Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile?.searchTags && profile.searchTags.length > 0
                  ? profile.searchTags.map((tag, idx) => (
                      <button
                        key={idx}
                        className="px-4 py-2 bg-muted/50 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
                      >
                        {tag}
                      </button>
                    ))
                  : [
                      "customer service",
                      "quality",
                      "response time",
                      "pricing",
                      "support",
                    ].map((tag, idx) => (
                      <button
                        key={idx}
                        className="px-4 py-2 bg-muted/50 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all opacity-40 hover:opacity-100"
                      >
                        {tag}
                      </button>
                    ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
