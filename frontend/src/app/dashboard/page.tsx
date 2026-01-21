"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";
import UserHeader from "../../components/dashboard/UserHeader";
import BrandLogo from "../../components/BrandLogo";
import DataTable, { Column } from "../admin/components/DataTable";

interface ComplaintItem {
  id: string;
  brand: {
    name: string;
    logoUrl?: string;
    isVerified?: boolean;
  };
  status: string;
  description: string;
  createdAt: string;
}

interface DashboardMetrics {
  totalComplaints: number;
  resolved: number;
  pending: number;
  needsInfo: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (
      session?.user &&
      ((session.user as any).role === "ADMIN" ||
        (session.user as any).role === "SUPER_ADMIN")
    ) {
      router.push("/admin");
    } else if (session?.user && (session.user as any).role === "BRAND") {
      router.push("/brand/dashboard");
    }
  }, [session, router]);

  const [params, setParams] = useState({
    limit: 10,
    offset: 0,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    search: "",
  });

  const fetchDashboardData = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const res = await axios.get(`${apiUrl}/dashboard`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      setMetrics(
        res.data.metrics || {
          totalComplaints: 0,
          resolved: 0,
          pending: 0,
          needsInfo: 0,
        },
      );

      // Global redirection for pending brand claims
      if (res.data.hasPendingClaim) {
        router.replace("/brand/verification-pending");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard metrics:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  const fetchComplaints = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      const res = await axios.get(`${apiUrl}/complaints`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        params,
      });

      setComplaints(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    }
  }, [session?.accessToken, params]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleParamsChange = useCallback((newParams: any) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const columns: Column<ComplaintItem>[] = [
    {
      header: "Brand",
      accessor: (item) => (
        <div className="relative flex items-center gap-3 p-2 min-h-16">
          <BrandLogo
            brandName={item.brand?.name || "Unknown"}
            brandLogoUrl={item.brand?.logoUrl}
            className="w-10 h-10 rounded-lg object-contain bg-white border border-border shadow-sm"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm truncate">
              {item.brand?.name || "Unknown"}
            </span>
          </div>

          {/* Verification Status Badge in top right */}
          {item.brand?.isVerified && (
            <div className="absolute top-1 right-1 flex items-center justify-center bg-primary/10 text-primary p-1 rounded-full border border-primary/20 scale-90 origin-top-right">
              <BadgeCheck className="w-4 h-4 fill-primary text-white" />
            </div>
          )}
        </div>
      ),
      sortable: true,
      sortKey: "brand.name",
    },
    {
      header: "Description",
      accessor: (item) => (
        <span className="text-small text-muted-foreground line-clamp-2">
          {item.description || "No description provided"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (item) => (
        <span
          className={`badge-base ${
            item.status === "RESOLVED"
              ? "bg-primary/10 text-primary"
              : item.status === "REJECTED"
                ? "bg-error/10 text-error"
                : item.status === "UNDER_REVIEW"
                  ? "bg-info/10 text-info"
                  : "bg-warning/10 text-warning"
          }`}
        >
          {item.status.replace("_", " ")}
        </span>
      ),
      sortable: true,
      sortKey: "status",
    },
    {
      header: "Submitted",
      accessor: (item) => (
        <span
          className="text-small text-muted-foreground"
          suppressHydrationWarning
        >
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      sortKey: "createdAt",
    },
  ];

  return (
    <>
      <UserHeader
        title="Dashboard Overview"
        subtitle="Welcome back! Here's what's happening with your complaints."
      />

      <div className="p-4 sm:p-8 space-y-8">
        {/* Premium Metrics Grid */}
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
          metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Complaints"
                value={metrics.totalComplaints}
                icon={Activity}
                gradient="from-primary to-primary/80"
                trend={5}
              />
              <MetricCard
                title="Resolved"
                value={metrics.resolved}
                icon={CheckCircle}
                gradient="from-primary to-primary/80"
                trend={12}
              />
              <MetricCard
                title="Pending Review"
                value={metrics.pending}
                icon={Clock}
                gradient="from-primary to-primary/80"
                trend={-3}
              />
              <MetricCard
                title="Needs Attention"
                value={metrics.needsInfo}
                icon={AlertCircle}
                gradient="from-primary to-primary/80"
                trend={-8}
              />
            </div>
          )
        )}

        {/* Complaints DataTable */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="heading-2 font-black italic">
                Dashboard Overview
              </h2>
              <p className="text-small text-muted-foreground mt-1 font-bold italic">
                Summary of your recent submissions and status
              </p>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={complaints}
            total={total}
            loading={loading}
            limit={params.limit}
            offset={params.offset}
            sortBy={params.sortBy}
            sortOrder={params.sortOrder}
            onParamsChange={handleParamsChange}
            onRowClick={(item) =>
              router.push(`/dashboard/complaints/${item.id}`)
            }
            searchPlaceholder="Search complaints by brand or description..."
          />
        </div>
      </div>
    </>
  );
}

// Premium Metric Card Component
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  trend?: number;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
}: MetricCardProps) {
  const isPositive = trend && trend > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-500">
      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
      />

      {/* Content */}
      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div
            className={`p-3 rounded-2xl bg-linear-to-br ${gradient} shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-micro ${
                isPositive
                  ? "bg-success/10 text-success"
                  : "bg-error/10 text-error"
              }`}
            >
              <TrendIcon className="w-3 h-3" />
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div>
          <p className="text-small font-bold text-muted-foreground">{title}</p>
          <p className="text-4xl font-bold mt-1">{value.toLocaleString()}</p>
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity duration-500`}
      />
    </div>
  );
}
