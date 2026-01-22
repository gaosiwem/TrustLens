"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import UserHeader from "../../../components/dashboard/UserHeader";
import BrandLogo from "../../../components/BrandLogo";
import DataTable, { Column } from "../../admin/components/DataTable";
import Link from "next/link";
import StandardLoader from "../../../components/StandardLoader";

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

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  const [params, setParams] = useState({
    limit: 10,
    offset: 0,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    search: "",
  });

  const fetchComplaints = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, params]);

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
        title="My Complaints"
        subtitle="Manage and track all your personal submissions"
      />

      <div className="p-4 sm:p-8">
        <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black italic tracking-tight">
                Active Reports
              </h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                Real-time tracking of your issues
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
            searchPlaceholder="Search your complaints..."
            useStandardPager={true}
          />
        </div>
      </div>
    </>
  );
}
