"use client";

import React from "react";
import { WidgetCard } from "../../../components/admin/WidgetCard";
import DarkModeToggle from "../../../components/DarkModeToggle";

export default function SystemHealthPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
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
        {/* System Status Banner */}
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

        {/* Performance Metrics */}
        <div>
          <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <WidgetCard
              title="API Uptime"
              value="99.9%"
              icon={
                <span className="material-symbols-outlined">cloud_done</span>
              }
              trend={{ value: 0.1, isPositive: true }}
            />
            <WidgetCard
              title="Response Time"
              value="45ms"
              icon={<span className="material-symbols-outlined">speed</span>}
              trend={{ value: 12, isPositive: false }}
            />
            <WidgetCard
              title="CPU Usage"
              value="23%"
              icon={<span className="material-symbols-outlined">memory</span>}
            />
            <WidgetCard
              title="Memory Usage"
              value="4.2 GB"
              icon={<span className="material-symbols-outlined">storage</span>}
            />
          </div>
        </div>

        {/* Database Status */}
        <div>
          <h2 className="text-xl font-bold mb-4">Database Status</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">PostgreSQL</h3>
                  <p className="text-sm text-muted-foreground">
                    Primary Database
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                  Connected
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Connections
                  </span>
                  <span className="font-medium">24 / 100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Database Size
                  </span>
                  <span className="font-medium">3.8 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Query Time
                  </span>
                  <span className="font-medium">12ms avg</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Redis Cache</h3>
                  <p className="text-sm text-muted-foreground">Session Store</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                  Connected
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Hit Rate
                  </span>
                  <span className="font-medium">96.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Memory Used
                  </span>
                  <span className="font-medium">156 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Keys</span>
                  <span className="font-medium">1,247</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div>
          <h2 className="text-xl font-bold mb-4">Service Status</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <WidgetCard
              title="Active Users"
              value="342"
              icon={<span className="material-symbols-outlined">group</span>}
            />
            <WidgetCard
              title="Active Admins"
              value="8"
              icon={
                <span className="material-symbols-outlined">
                  admin_panel_settings
                </span>
              }
            />
            <WidgetCard
              title="Queue Length"
              value="0"
              icon={<span className="material-symbols-outlined">queue</span>}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
