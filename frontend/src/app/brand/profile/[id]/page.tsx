"use client";

import { useState, useEffect, useRef } from "react";
import {
  BadgeCheck,
  Globe,
  Star,
  Users,
  ArrowLeft,
  Settings,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getAssetUrl } from "../../../../lib/utils";
import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import RatingStars from "../../../../components/RatingStars";
import { ReviewCard } from "../../../../components/ReviewCard";
import { useSession } from "next-auth/react";
import TrustBreakdown from "../../../../components/brand/TrustBreakdown";
import EnforcementNotice from "../../../../components/brand/EnforcementNotice";
import axios from "axios";
import EditBrandDialog from "../../../../components/brand/EditBrandDialog";
import BrandHeader from "../../../../components/brand/BrandHeader";

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
    averageRating: number;
    arithmeticAverage: number;
    totalRatings: number;
    totalComplaints: number;
    ratingDistribution: number[];
    responseRate: number;
  };
  managerId?: string;
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

export default function ManagerBrandProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [enforcements, setEnforcements] = useState<any[]>([]);
  const [trustScoreDetails, setTrustScoreDetails] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim().toLowerCase();
      const starMatch =
        trimmed.match(/^([1-5])\s*stars?$/) || trimmed.match(/^([1-5])$/);
      if (starMatch) {
        const starNum = parseInt(starMatch[1]);
        if (!filterStars.includes(starNum)) {
          setFilterStars((prev) => [...prev, starNum]);
        }
        setSearchQuery("");
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
      if (!id || !session) return;
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

          const userId =
            (session?.user as any)?.id || (session?.user as any)?.userId;
          if (data.managerId !== userId && session?.user?.role !== "ADMIN") {
            router.push("/brand/dashboard");
            return;
          }

          if (session?.accessToken) {
            const [enfRes, trustRes] = await Promise.all([
              axios.get(`${apiUrl}/brands/${id}/enforcements`, {
                headers: { Authorization: `Bearer ${session.accessToken}` },
              }),
              axios.get(`${apiUrl}/brands/${id}/trust-score`, {
                headers: { Authorization: `Bearer ${session.accessToken}` },
              }),
            ]);
            setEnforcements(enfRes.data);
            setTrustScoreDetails(trustRes.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch manager brand profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [
    id,
    session,
    currentPage,
    filterStars,
    debouncedSearch,
    sortBy,
    filterReplied,
    filterVerified,
    router,
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
          <Link href="/brand/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <BrandHeader
        title={profile?.name || "Brand Profile"}
        subtitle="Management & Response Dashboard"
      />

      {/* Breadcrumb / Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/brand/dashboard"
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>
      </div>

      {/* Premium Hero Section */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-4xl bg-background border-muted overflow-hidden flex items-center justify-center shadow-lg">
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
                  {profile?.isVerified ? (
                    <BadgeCheck className="w-8 h-8 text-white fill-primary ml-2" />
                  ) : (
                    <BadgeCheck className="w-8 h-8 text-muted-foreground opacity-20 ml-2" />
                  )}
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-primary tracking-widest uppercase">
                      Management Console
                    </span>
                  </div>
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
              <button
                onClick={() => setIsEditDialogOpen(true)}
                className="w-full sm:w-auto h-14 px-8 rounded-2xl font-bold bg-muted hover:bg-muted/80 text-foreground border-2 border-border flex items-center justify-center gap-2 transition-all"
              >
                <Settings className="w-5 h-5" />
                Edit Profile
              </button>
              <Link
                href={`/brands/${profile?.id}`}
                target="_blank"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-[200px] h-14 rounded-2xl font-bold border-2 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Public View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
        <EnforcementNotice enforcements={enforcements} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Main Feed */}
          <section className="space-y-12">
            {/* AI Summary Section */}
            <div className="p-8 rounded-4xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl transition-colors group-hover:bg-primary/10 duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-white text-xl">
                      auto_awesome
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">
                    Manager Resolution Intelligence
                  </h3>
                </div>
                <p className="text-foreground/80 leading-relaxed text-lg italic">
                  "As a brand manager, you should note that {profile?.name} has
                  achieved a{Math.round(profile?.stats.responseRate || 0)}%
                  response rate. Aiming for 90%+ can significantly boost your
                  TrustScore™ by improving the 'Activity' factor."
                </p>
              </div>
            </div>

            {/* Filter Tabs Header */}
            <div className="space-y-6" ref={reviewsRef}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black tracking-tight">
                    Managed Reviews
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
                      Clear All Filters
                    </button>
                  )}
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
                    All
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
                    Awaiting Reply
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
                    className={`material-symbols-outlined text-sm ${filterVerified ? "variation-fill" : ""}`}
                  >
                    verified
                  </span>
                  Verified Customers
                </button>
              </div>

              <div className="relative group flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Filter your brand reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-28 bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl outline-none font-bold transition-all text-sm placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Review Grid */}
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {profile?.complaints.map((complaint: any) => {
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
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-8">
            {trustScoreDetails && profile && (
              <TrustBreakdown
                averageRating={profile.stats.averageRating}
                factors={trustScoreDetails?.metadata?.factors}
              />
            )}

            {/* Stats Card */}
            <div className="p-8 rounded-4xl bg-card border border-border">
              <h3 className="text-lg font-black mb-8 tracking-tight">
                Response Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-muted/20 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Resolution Rate
                  </span>
                  <span className="text-xl font-black text-primary">
                    {Math.round(profile?.stats.responseRate || 0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* About Card */}
            <div className="p-8 rounded-4xl bg-card border border-border shadow-sm">
              <h3 className="text-lg font-black mb-6 tracking-tight">
                Support Information
              </h3>
              <div className="space-y-6">
                <div className="pt-4 border-t border-border space-y-4">
                  {profile?.supportPhone && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary">
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
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">
                          mail
                        </span>
                      </div>
                      <span className="text-sm font-bold truncate max-w-[200px]">
                        {profile.supportEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <EditBrandDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        brand={
          profile
            ? {
                id: profile.id,
                name: profile.name,
                logoUrl: profile.logoUrl,
                description: profile.description,
                websiteUrl: profile.websiteUrl,
                supportEmail: profile.supportEmail,
                supportPhone: profile.supportPhone,
              }
            : null
        }
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
