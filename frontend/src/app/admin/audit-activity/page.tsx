"use client";

import React from "react";
import AuditTable from "../../../components/tables/AuditTable";
import MetricCard from "../../../components/cards/MetricCard";
import DarkModeToggle from "../../../components/DarkModeToggle";

export default function AuditActivityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Audit Activity</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor all system activities and user actions
            </p>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Total Events"
            value="1,234"
            icon={<span className="material-symbols-outlined">event_note</span>}
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard
            title="Today's Events"
            value="45"
            icon={<span className="material-symbols-outlined">today</span>}
          />
          <MetricCard
            title="Active Users"
            value="23"
            icon={<span className="material-symbols-outlined">person</span>}
          />
        </div>

        {/* Audit Table */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <AuditTable />
        </div>
      </main>
    </div>
  );
}
