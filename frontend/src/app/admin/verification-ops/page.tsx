"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface VerificationOpsData {
  overview: {
    total: number;
    byStatus: Array<{ status: string; _count: number }>;
  };
  revenue: {
    count: number;
    totalRevenue: number;
  };
  sla: {
    overdue: number;
  };
  fraud: Array<{ brandId: string; _count: number }>;
  audits: Array<{
    id: string;
    action: string;
    reason?: string;
    createdAt: string;
  }>;
}

export default function VerificationOpsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerificationOpsData | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchData = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const headers = { Authorization: `Bearer ${session.accessToken}` };

        const [overview, revenue, sla, fraud, audits] = await Promise.all([
          fetch(`${apiUrl}/admin/verification/overview`, { headers }).then(
            (r) => r.json()
          ),
          fetch(`${apiUrl}/admin/verification/revenue`, { headers }).then((r) =>
            r.json()
          ),
          fetch(`${apiUrl}/admin/verification/sla?hours=48`, { headers }).then(
            (r) => r.json()
          ),
          fetch(`${apiUrl}/admin/verification/fraud`, { headers }).then((r) =>
            r.json()
          ),
          fetch(`${apiUrl}/admin/verification/audits`, { headers }).then((r) =>
            r.json()
          ),
        ]);

        setData({ overview, revenue, sla, fraud, audits });
      } catch (error) {
        console.error("Failed to fetch verification ops data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.accessToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Unable to load verification operations data
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold italic tracking-tighter underline decoration-primary decoration-4 underline-offset-8 mb-6">
          Verification Operations Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Monitor verification workload, revenue, SLA compliance, and governance
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => {
            // Navigate to brands tab - need to pass this as prop
            window.location.href = "/admin?tab=brands";
          }}
          className="p-6 rounded-3xl bg-card border border-border hover:border-primary transition-all cursor-pointer text-left"
        >
          <div className="text-xs font-black tracking-widest text-muted-foreground mb-2">
            Total Verifications
          </div>
          <div className="text-3xl font-black italic">
            {data.overview.total}
          </div>
        </button>

        <button
          onClick={() => {
            window.location.href = "/admin?tab=brands";
          }}
          className="p-6 rounded-3xl bg-card border border-border hover:border-primary transition-all cursor-pointer text-left"
        >
          <div className="text-xs font-black tracking-widest text-muted-foreground mb-2">
            Active Subscriptions
          </div>
          <div className="text-3xl font-black italic">{data.revenue.count}</div>
        </button>

        <div className="p-6 rounded-3xl bg-card border border-border">
          <div className="text-xs font-black tracking-widest text-muted-foreground mb-2">
            Total Revenue
          </div>
          <div className="text-3xl font-black italic">
            R{data.revenue.totalRevenue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="p-6 rounded-3xl bg-card border border-border">
        <h3 className="text-lg font-bold mb-4">
          Verification Status Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.overview.byStatus.map((item) => (
            <div key={item.status} className="p-4 rounded-xl bg-muted/30">
              <div className="text-[10px] font-black tracking-widest text-muted-foreground">
                {item.status}
              </div>
              <div className="text-2xl font-black">{item._count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA Compliance */}
      <div className="p-6 rounded-3xl bg-card border border-border">
        <h3 className="text-lg font-bold mb-4">SLA Compliance (48 hours)</h3>
        <div className="flex items-center gap-4">
          <div
            className={`text-4xl font-black ${
              data.sla.overdue > 0 ? "text-red-500" : "text-green-500"
            }`}
          >
            {data.sla.overdue}
          </div>
          <div className="text-sm text-muted-foreground">
            {data.sla.overdue === 0
              ? "All requests within SLA"
              : "Overdue verification requests"}
          </div>
        </div>
      </div>

      {/* Fraud Signals */}
      {data.fraud.length > 0 && (
        <div className="p-6 rounded-3xl bg-card border border-border">
          <h3 className="text-lg font-bold mb-4 text-amber-600 dark:text-amber-400">
            ⚠️ Fraud Signals Detected
          </h3>
          <div className="space-y-2">
            {data.fraud.map((item) => (
              <div
                key={item.brandId}
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm"
              >
                Brand ID: {item.brandId} - {item._count} rejections
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Audit Logs */}
      <div className="p-6 rounded-3xl bg-card border border-border">
        <h3 className="text-lg font-bold mb-4">Recent Audit Logs</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.audits.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No audit logs yet
            </p>
          ) : (
            data.audits.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-muted/30 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="font-bold">{log.action}</div>
                    {log.reason && (
                      <div className="text-muted-foreground">{log.reason}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
