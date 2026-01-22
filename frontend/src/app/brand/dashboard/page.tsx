"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle,
  Clock,
  Building2,
  ExternalLink,
  ShieldCheck,
  Settings,
} from "lucide-react";
import BrandLogo from "../../../components/BrandLogo";
import DataTable, { Column } from "../../admin/components/DataTable";
import clsx from "clsx";
import EditBrandDialog from "../../../components/brand/EditBrandDialog";
import BrandHeader from "../../../components/brand/BrandHeader";
import { MetricCard } from "../../../components/brand/MetricCard";

interface ManagedBrand {
  id: string;
  name: string;
  isVerified: boolean;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
}

interface BrandMetrics {
  totalComplaints: number;
  totalComplaintsTrend: number;
  resolved: number;
  resolvedTrend: number;
  pending: number;
  pendingTrend: number;
  needsInfo: number;
  needsInfoTrend: number;
  underReview: number;
}

interface BrandDashboardData {
  metrics: BrandMetrics;
  managedBrands: ManagedBrand[];
  trends?: any[];
  statusDistribution?: any[];
  insights?: {
    topIssue: string;
    resolutionSuggestion: string;
    resolutionRate: number;
  };
}

export default function BrandDashboard() {
  const [data, setData] = useState<BrandDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Complaints state
  const [complaints, setComplaints] = useState<any[]>([]);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintParams, setComplaintParams] = useState({
    limit: 10,
    offset: 0,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    status: "",
    search: "",
  });

  // Edit Brand state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<ManagedBrand | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const res = await axios.get(`${apiUrl}/dashboard`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      const metrics = res.data.metrics || {
        totalComplaints: 0,
        totalComplaintsTrend: 0,
        resolved: 0,
        resolvedTrend: 0,
        pending: 0,
        pendingTrend: 0,
        needsInfo: 0,
        needsInfoTrend: 0,
        underReview: 0,
      };

      setData({
        metrics,
        managedBrands: res.data.managedBrands || [],
        trends: res.data.trends,
        statusDistribution: res.data.statusDistribution,
        insights: res.data.insights,
      });

      // Redirection logic for brands
      const hasVerifiedBrand = res.data.hasVerifiedBrand;
      const hasPendingClaim = res.data.hasPendingClaim;
      const managedBrands = res.data.managedBrands || [];

      // If no verified brand and no pending claim, redirect to claim page
      if (!hasVerifiedBrand && !hasPendingClaim && managedBrands.length === 0) {
        router.push("/brand/claim");
        return;
      }

      // If has pending claim but no verified brand, show pending page
      if (!hasVerifiedBrand && hasPendingClaim) {
        router.push("/brand/verification-pending");
      }
    } catch (error) {
      console.error("Failed to fetch brand dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchComplaints = useCallback(async () => {
    if (!session?.accessToken) return;

    setComplaintsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const res = await axios.get(`${apiUrl}/dashboard/complaints`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        params: complaintParams,
      });

      setComplaints(res.data.items);
      setTotalComplaints(res.data.total);
    } catch (error) {
      console.error("Failed to fetch brand complaints:", error);
    } finally {
      setComplaintsLoading(false);
    }
  }, [session?.accessToken, complaintParams]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const columns: Column<any>[] = [
    {
      header: "Summary",
      accessor: (item) => (
        <div className="flex flex-col gap-1 min-w-[300px]">
          <span className="font-bold text-sm text-foreground line-clamp-1">
            {item.description || item.title}
          </span>
        </div>
      ),
      sortable: true,
      sortKey: "title",
    },
    {
      header: "Brand",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white border border-border flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
            <BrandLogo
              brandName={item.brandName}
              brandLogoUrl={item.brandLogoUrl}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-sm font-medium truncate max-w-[120px]">
            {item.brandName}
          </span>
        </div>
      ),
      sortable: true,
      sortKey: "brandName",
    },
    {
      header: "User",
      accessor: (item) => (
        <span className="text-sm font-medium">{item.userName}</span>
      ),
    },
    {
      header: "Status",
      accessor: (item) => (
        <div
          className={clsx(
            "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase inline-block border",
            item.status === "RESOLVED" &&
              "bg-primary/10 text-primary border-primary/20",
            item.status === "REJECTED" &&
              "bg-red-500/10 text-red-600 border-red-500/20",
            (item.status === "SUBMITTED" || item.status === "UNDER_REVIEW") &&
              "bg-blue-500/10 text-blue-600 border-blue-500/20",
            item.status === "NEEDS_INFO" &&
              "bg-amber-500/10 text-amber-600 border-amber-500/20",
          )}
        >
          {item.status.replace("_", " ")}
        </div>
      ),
      sortable: true,
      sortKey: "status",
    },
    {
      header: "Date",
      accessor: (item) => (
        <span className="text-sm text-muted-foreground font-medium">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      sortKey: "createdAt",
    },
  ];

  return (
    <>
      <BrandHeader
        title="Brand Overview"
        subtitle="Performance metrics for your managed brands"
        onMenuClick={() => setMobileNavOpen(true)}
      />

      <div className="p-4 sm:p-8 space-y-8">
        {/* Metrics Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 bg-card rounded-3xl animate-pulse border border-border"
              />
            ))}
          </div>
        ) : (
          data?.metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Complaints"
                value={data.metrics.totalComplaints}
                icon={Activity}
                gradient="from-primary to-primary/80"
                trend={data.metrics.totalComplaintsTrend}
              />
              <MetricCard
                title="Resolved"
                value={data.metrics.resolved}
                icon={CheckCircle}
                gradient="from-primary to-primary/80"
                trend={data.metrics.resolvedTrend}
              />
              <MetricCard
                title="Pending"
                value={data.metrics.pending}
                icon={Clock}
                gradient="from-primary/60 to-primary/40"
                trend={data.metrics.pendingTrend}
              />
              <MetricCard
                title="Resolution Rate"
                value={data.insights?.resolutionRate || 0}
                icon={ShieldCheck}
                gradient="from-primary to-primary/80"
                suffix="%"
              />
            </div>
          )
        )}

        {/* Managed Brands Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="heading-2 font-bold">Managed Brands</h2>
              <p className="text-small text-muted-foreground mt-1">
                Active brands under your management
              </p>
            </div>
            <Link href="/brand/add">
              <button className="btn-base btn-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">add</span>
                Add Brand
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
              [1, 2].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-card rounded-3xl animate-pulse border border-border"
                />
              ))
            ) : data?.managedBrands && data.managedBrands.length > 0 ? (
              data.managedBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="p-6 rounded-3xl bg-card border border-border flex items-start gap-6 hover:shadow-lg transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white border border-border flex items-center justify-center p-2 shadow-sm shrink-0">
                    <BrandLogo
                      brandName={brand.name}
                      brandLogoUrl={brand.logoUrl}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-xl truncate">
                        {brand.name}
                      </h3>
                      {brand.isVerified && (
                        <span className="material-symbols-outlined text-primary variation-fill text-lg">
                          verified
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setEditingBrand(brand);
                          setIsEditDialogOpen(true);
                        }}
                        className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors ml-auto"
                        title="Edit Brand Details"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {brand.description ||
                        "No description provided for this brand."}
                    </p>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/brand/profile/${brand.id}`}
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        View Profile
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      {brand.websiteUrl && (
                        <a
                          href={
                            brand.websiteUrl.startsWith("http")
                              ? brand.websiteUrl
                              : `https://${brand.websiteUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-muted-foreground flex items-center gap-1 hover:text-foreground"
                        >
                          Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
                <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-bold text-lg">No managed brands found</h3>
                <p className="text-muted-foreground mb-6">
                  Claim your first brand to start managing reputation
                </p>
                <Link href="/brand/claim">
                  <button className="btn-base btn-secondary">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* AI Insight */}
        {data?.insights && (
          <div className="p-8 rounded-4xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl transition-colors group-hover:bg-primary/10 duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <span className="material-symbols-outlined text-white text-3xl">
                  auto_awesome
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black mb-1">
                  AI Performance Summary
                </h3>
                <p className="text-foreground/80 leading-relaxed font-medium italic">
                  "{data.insights.resolutionSuggestion}"
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-primary bg-primary/10 px-2 py-1 rounded">
                    Top Issue: {data.insights.topIssue}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Complaints Table */}
        <section className="space-y-6 pb-12">
          <div>
            <h2 className="heading-2 font-bold">Complaint Management</h2>
            <p className="text-small text-muted-foreground mt-1">
              Track and respond to consumer issues
            </p>
          </div>

          <DataTable
            columns={columns}
            data={complaints}
            total={totalComplaints}
            loading={complaintsLoading}
            limit={complaintParams.limit}
            offset={complaintParams.offset}
            sortBy={complaintParams.sortBy}
            sortOrder={complaintParams.sortOrder}
            onParamsChange={useCallback(
              (newParams: any) =>
                setComplaintParams((prev) => ({ ...prev, ...newParams })),
              [],
            )}
            onRowClick={(item) => router.push(`/brand/complaints/${item.id}`)}
            searchPlaceholder="Search complaints..."
          />
        </section>
      </div>

      <EditBrandDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        brand={editingBrand}
        onSuccess={fetchDashboardData}
      />
    </>
  );
}
