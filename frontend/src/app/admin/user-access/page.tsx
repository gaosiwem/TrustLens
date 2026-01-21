"use client";

import React from "react";
import UserAccessTable from "../../../components/tables/UserAccessTable";
import MetricCard from "../../../components/cards/MetricCard";
import DarkModeToggle from "../../../components/DarkModeToggle";

export default function UserAccessPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              User Access Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-8 space-y-8 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value="156"
            icon={<span className="material-symbols-outlined">group</span>}
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard
            title="Admins"
            value="5"
            icon={
              <span className="material-symbols-outlined">
                admin_panel_settings
              </span>
            }
          />
          <MetricCard
            title="Moderators"
            value="12"
            icon={
              <span className="material-symbols-outlined">verified_user</span>
            }
          />
          <MetricCard
            title="Active Today"
            value="48"
            icon={
              <span className="material-symbols-outlined">sensor_occupied</span>
            }
          />
        </div>

        {/* User Table */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-bold">User List</h2>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 w-full sm:w-auto">
              <span className="material-symbols-outlined text-sm">add</span>
              Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <UserAccessTable />
          </div>
        </div>
      </main>
    </div>
  );
}
