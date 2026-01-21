"use client";

import React from "react";
import { AdminSettingsForm } from "../../../components/admin/AdminSettingsForm";
import DarkModeToggle from "../../../components/DarkModeToggle";

export default function PlatformSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Platform Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure core platform settings and preferences
            </p>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
        <AdminSettingsForm />
      </main>
    </div>
  );
}
