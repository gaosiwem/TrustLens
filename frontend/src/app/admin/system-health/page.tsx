"use client";

import React from "react";
import MetricCard from "../../../components/cards/MetricCard";
import DarkModeToggle from "../../../components/DarkModeToggle";

export default function SystemHealthPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">System Health</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor system performance and resource usage
            </p>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
        {/* System Status */}
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">
              check_circle
            </span>
            <div>
              <h3 className="font-bold text-green-800 dark:text-green-300">
                All Systems Operational
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                Last checked: Just now
              </p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            title="CPU Usage"
            value="23%"
            icon={<span className="material-symbols-outlined">memory</span>}
          />
          <MetricCard
            title="Memory"
            value="4.2 GB"
            icon={<span className="material-symbols-outlined">storage</span>}
          />
          <MetricCard
            title="Uptime"
            value="99.9%"
            icon={<span className="material-symbols-outlined">schedule</span>}
            trend={{ value: 0.1, isPositive: true }}
          />
          <MetricCard
            title="Response Time"
            value="45ms"
            icon={<span className="material-symbols-outlined">speed</span>}
          />
        </div>

        {/* Database Status */}
        <div>
          <h2 className="text-xl font-bold mb-4">Database Status</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">PostgreSQL</h3>
                  <p className="text-sm text-muted-foreground">
                    Primary Database
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                  Connected
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connections</span>
                  <span className="font-medium">12 / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">2.4 GB</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">Redis Cache</h3>
                  <p className="text-sm text-muted-foreground">Session Store</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                  Connected
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hit Rate</span>
                  <span className="font-medium">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Memory</span>
                  <span className="font-medium">124 MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
