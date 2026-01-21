"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import ComplaintDrawer from "./ComplaintDrawer";
import DataTable, { Column } from "./DataTable";
import BrandLogo from "../../../components/BrandLogo";
import { BadgeCheck } from "lucide-react";

interface ComplaintItem {
  id: string;
  brandName: string;
  brandLogoUrl?: string;
  isVerified: boolean;
  status: string;
  submittedAt: string;
}

export default function ComplaintTable() {
  const { data: session } = useSession();
  const [data, setData] = useState<ComplaintItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const [params, setParams] = useState({
    limit: 20,
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
      const res = await axios.get(`${apiUrl}/admin/complaints`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        params,
      });
      setData(res.data.items);
      setTotal(res.data.total);
    } catch (error) {
      console.error("Failed to fetch admin complaints:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, params]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const columns: Column<ComplaintItem>[] = [
    {
      header: "Brand",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <BrandLogo
            brandName={item.brandName}
            brandLogoUrl={item.brandLogoUrl}
            className="w-10 h-10 rounded-lg object-contain bg-white border border-border shadow-sm"
          />
          <div className="flex items-center gap-1 min-w-0">
            <span className="truncate">{item.brandName}</span>
            {item.isVerified && (
              <BadgeCheck className="w-4 h-4 text-white fill-primary shrink-0" />
            )}
          </div>
        </div>
      ),
      sortable: true,
      sortKey: "brandId",
    },
    {
      header: "Status",
      accessor: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${
            item.status === "RESOLVED"
              ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
              : item.status === "REJECTED"
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
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
        <span className="text-muted-foreground" suppressHydrationWarning>
          {new Date(item.submittedAt).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      sortKey: "createdAt",
    },
  ];

  const handleParamsChange = useCallback((newParams: any) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        total={total}
        loading={loading}
        limit={params.limit}
        offset={params.offset}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onParamsChange={handleParamsChange}
        onRowClick={setSelected}
        searchPlaceholder="Search complaints..."
      />

      <ComplaintDrawer
        complaint={selected}
        onClose={() => setSelected(null)}
        onUpdate={() => fetchComplaints()}
      />
    </>
  );
}
