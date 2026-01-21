"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

interface Escalation {
  id: string;
  complaintId: string;
  escalatedBy: string;
  reason: string;
  status: string;
  createdAt: string;
  complaint: {
    title: string;
    brand: { name: string };
    user: { name: string; email: string };
  };
}

interface Enforcement {
  id: string;
  entityType: string;
  entityId: string;
  actionType: string;
  reason: string;
  createdAt: string;
}

export default function GovernanceDashboard() {
  const { data: session } = useSession();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [enforcements, setEnforcements] = useState<Enforcement[]>([]);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) return;
      try {
        const [escRes, enfRes, heatRes] = await Promise.all([
          axios.get(`${API_URL}/admin/governance/escalations`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          axios.get(`${API_URL}/admin/governance/enforcements`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          axios.get(`${API_URL}/admin/governance/heatmap`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
        ]);

        setEscalations(escRes.data);
        setEnforcements(enfRes.data);
        setHeatmap(heatRes.data);
      } catch (error) {
        console.error("Failed to fetch governance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.accessToken]);

  const escalationColumns: Column<Escalation>[] = [
    { header: "Complaint", accessor: (row) => row.complaint.title },
    { header: "Brand", accessor: (row) => row.complaint.brand.name },
    { header: "Escalated By", accessor: "escalatedBy" },
    {
      header: "Status",
      accessor: (row) => (
        <span
          className={`badge-base ${
            row.status === "RESOLVED"
              ? "bg-primary/20 text-primary"
              : "bg-warning/20 text-warning"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const enforcementColumns: Column<Enforcement>[] = [
    { header: "Entity", accessor: "entityType" },
    {
      header: "Action",
      accessor: (row) => (
        <span className="font-bold text-error">{row.actionType}</span>
      ),
    },
    { header: "Reason", accessor: "reason" },
    {
      header: "Date",
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-500">
      <header>
        <h1 className="heading-1">Platform Governance</h1>
        <p className="text-muted-foreground mt-2">
          Manage escalations, trust scores, and enforcement actions.
        </p>
      </header>

      {/* Trust Heatmap */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-base bg-error/10 border-error/20">
          <p className="text-caption font-bold text-error uppercase tracking-widest">
            Critical Risk
          </p>
          <p className="text-4xl font-black mt-2">{heatmap?.CRITICAL || 0}</p>
        </div>
        <div className="card-base bg-warning/10 border-warning/20">
          <p className="text-caption font-bold text-warning uppercase tracking-widest">
            High Risk
          </p>
          <p className="text-4xl font-black mt-2">{heatmap?.HIGH || 0}</p>
        </div>
        <div className="card-base bg-info/10 border-info/20">
          <p className="text-caption font-bold text-info uppercase tracking-widest">
            Medium Risk
          </p>
          <p className="text-4xl font-black mt-2">{heatmap?.MEDIUM || 0}</p>
        </div>
        <div className="card-base bg-primary/10 border-primary/20">
          <p className="text-caption font-bold text-primary uppercase tracking-widest">
            Healthy
          </p>
          <p className="text-4xl font-black mt-2">{heatmap?.LOW || 0}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Escalations */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="heading-3">Escalation Queue</h2>
            <span className="badge-base bg-primary/10 text-primary">
              {escalations.length} Pending
            </span>
          </div>
          <DataTable
            columns={escalationColumns}
            data={escalations}
            loading={loading}
            total={escalations.length}
            limit={10}
            offset={0}
            onParamsChange={() => {}}
            searchPlaceholder="Search escalations..."
          />
        </section>

        {/* Enforcements */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="heading-3">Active Enforcements</h2>
            <span className="badge-base bg-error/10 text-error">
              {enforcements.length} Active
            </span>
          </div>
          <DataTable
            columns={enforcementColumns}
            data={enforcements}
            loading={loading}
            total={enforcements.length}
            limit={10}
            offset={0}
            onParamsChange={() => {}}
            searchPlaceholder="Search enforcements..."
          />
        </section>
      </div>
    </div>
  );
}
