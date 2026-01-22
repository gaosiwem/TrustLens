"use client";

import { useState, useEffect, useRef } from "react";
import {
  BadgeCheck,
  Globe,
  Star,
  Users,
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
import { toast } from "sonner";
import StandardLoader from "../../../../components/StandardLoader";
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

  useEffect(() => {
    async function fetchProfile() {
      if (!id || !session) return;
      setLoading(true);
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        let url = `${apiUrl}/brands/public/${id}`;

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
  }, [id, session, router]);

  if (loading && !profile) {
    return <StandardLoader fullPage />;
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
                  <span className="text-2xl font-black text-muted-foreground/30">
                    {profile?.name[0]}
                  </span>
                )}
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <h1 className="text-3xl lg:text-3xl font-black tracking-tighter">
                    {profile?.name}
                  </h1>
                  {profile?.isVerified ? (
                    <BadgeCheck className="w-8 h-8 text-white fill-primary ml-2" />
                  ) : (
                    <BadgeCheck className="w-8 h-8 text-muted-foreground opacity-20 ml-2" />
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
                className="btn-base btn-secondary w-full sm:w-auto px-8 rounded-2xl border-2"
              >
                <span className="material-symbols-outlined text-xl">
                  settings
                </span>
                Edit Profile
              </button>
              <Link
                href={`/brands/${profile?.id}`}
                target="_blank"
                className="w-full sm:w-auto"
              >
                <button className="btn-base btn-secondary bg-transparent hover:bg-muted w-full sm:w-auto px-8 rounded-2xl border-2 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-xl">
                    open_in_new
                  </span>
                  Public View
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20 space-y-12">
        <EnforcementNotice enforcements={enforcements} />

        {/* AI Insight Spotlight */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="p-10 rounded-4xl bg-primary/5 border border-primary/10 relative overflow-hidden group shadow-2xl shadow-primary/5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[120px] transition-all group-hover:bg-primary/20 duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-20 -mb-20 blur-[100px]" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] shrink-0">
                <span className="material-symbols-outlined text-white text-3xl">
                  auto_awesome
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black tracking-tight text-foreground">
                    Resolution Intelligence
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                    AI Guided
                  </span>
                </div>
                <p className="text-foreground/70 leading-relaxed text-xl italic font-medium max-w-4xl">
                  "As a brand manager, you should note that {profile?.name} has
                  achieved a {Math.round(profile?.stats.responseRate || 0)}%
                  response rate. Aiming for 90%+ can significantly boost your
                  TrustScore™ by improving the 'Activity' factor."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trust Breakdown Column */}
          <div className="lg:col-span-1 space-y-8 h-full">
            {trustScoreDetails && profile && (
              <div className="h-full">
                <TrustBreakdown
                  averageRating={profile.stats.averageRating}
                  factors={trustScoreDetails?.metadata?.factors}
                  calculation={trustScoreDetails?.metadata?.calculation}
                />
              </div>
            )}
          </div>

          {/* Performance & About Column */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            {/* Resolution Efficiency Card */}
            <div className="p-10 rounded-4xl bg-card border border-border flex flex-col justify-between group hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5">
              <div>
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-2xl">
                    trending_up
                  </span>
                </div>
                <h3 className="text-xl font-black mb-2 tracking-tight">
                  Resolution Rate
                </h3>
                <p className="text-sm text-muted-foreground font-medium mb-8">
                  Your efficiency in addressing consumer follow-ups and
                  resolving complaints.
                </p>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-5xl font-black text-primary tracking-tighter">
                    {Math.round(profile?.stats.responseRate || 0)}%
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2">
                    Current Performance
                  </span>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-muted border-t-primary animate-spin-slow opacity-20" />
              </div>
            </div>

            {/* Brand Status Card */}
            <div className="p-10 rounded-4xl bg-card border border-border group hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-2xl">
                  verified
                </span>
              </div>
              <h3 className="text-xl font-black mb-2 tracking-tight">
                Brand Identity
              </h3>
              <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
                {profile?.description ||
                  `Managing reviews and consumer trust for ${profile?.name}. Use this dashboard to respond to follow-ups and improve your TrustScore.`}
              </p>

              <div className="space-y-4 pt-6 border-t border-border">
                {profile?.websiteUrl && (
                  <Link
                    href={
                      profile.websiteUrl.startsWith("http")
                        ? profile.websiteUrl
                        : `https://${profile.websiteUrl}`
                    }
                    target="_blank"
                    className="flex items-center justify-between group/link"
                  >
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Website
                    </span>
                    <div className="flex items-center gap-2 text-primary font-black text-sm group-hover/link:underline underline-offset-4 decoration-2">
                      {profile.websiteUrl.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </Link>
                )}
                {profile?.supportEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Support
                    </span>
                    <span className="text-sm font-black text-foreground">
                      {profile.supportEmail}
                    </span>
                  </div>
                )}
                {profile?.supportPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Direct
                    </span>
                    <span className="text-sm font-black text-foreground">
                      {profile.supportPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
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
