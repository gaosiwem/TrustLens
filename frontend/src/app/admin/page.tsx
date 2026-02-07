"use client";

import { useState } from "react";
import StatsCards from "./components/StatsCards";
import ComplaintTable from "./components/ComplaintTable";
import ResolutionTrendChart from "./components/charts/ResolutionTrendChart";
import StatusBreakdownChart from "./components/charts/StatusBreakdownChart";
import BrandManager from "@/app/admin/components/BrandManager";
import DarkModeToggle from "../../components/DarkModeToggle";
import Link from "next/link";
import clsx from "clsx";

import { useSession, signOut } from "next-auth/react";
import UserManager from "./components/UserManager";
import AdminBrandQueue from "../../components/AdminBrandQueue";
import AdminVerificationQueue from "./components/AdminVerificationQueue";
import VerificationOps from "./verification-ops/page";
import InvoiceManager from "./components/InvoiceManager";
import GovernanceDashboard from "./components/GovernanceDashboard";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "brands"
    | "users"
    | "claims"
    | "verification"
    | "verification-ops"
    | "governance"
    | "invoices"
  >("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 sticky top-0 z-40">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <img src="/logo.png" alt="TrustLens" className="h-10 w-auto" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  Admin
                </span>
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Operational intelligence & platform control
              </p>
            </div>
            <Link
              href="/"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                open_in_new
              </span>
              Return to Site
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <div className="h-8 w-px bg-border mx-2" />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all text-sm font-bold"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card px-6">
        <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={clsx(
              "py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("brands")}
            className={clsx(
              "py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === "brands"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Brand Management
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={clsx(
              "py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("claims")}
            className={clsx(
              "py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === "claims"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Brand Claims
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={clsx(
              "py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === "verification"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Verification Requests
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={clsx(
              "py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === "invoices"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab("verification-ops")}
            className={clsx(
              "py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === "verification-ops"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Verification Ops
          </button>
          <button
            onClick={() => setActiveTab("governance")}
            className={clsx(
              "py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === "governance"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Governance
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
        {activeTab === "overview" && (
          <>
            {/* Stats */}
            <StatsCards />

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ResolutionTrendChart />
              <StatusBreakdownChart />
            </div>

            {/* Complaint Table */}
            <div>
              <h2 className="text-xl font-bold mb-4">Recent Complaints</h2>
              <ComplaintTable />
            </div>
          </>
        )}
        {activeTab === "brands" && <BrandManager />}
        {activeTab === "users" && <UserManager />}
        {activeTab === "claims" && <AdminBrandQueue />}
        {activeTab === "verification" && <AdminVerificationQueue />}
        {activeTab === "verification-ops" && <VerificationOps />}
        {activeTab === "governance" && <GovernanceDashboard />}
        {activeTab === "invoices" && <InvoiceManager />}
      </main>
    </div>
  );
}
