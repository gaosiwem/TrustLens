"use client";

import React, { useState } from "react";
import { ToggleSwitch } from "../../../components/admin/ToggleSwitch";
import DarkModeToggle from "../../../components/DarkModeToggle";

export default function FeatureTogglesPage() {
  const [features, setFeatures] = useState({
    aiAnalysis: true,
    emailNotifications: true,
    pushNotifications: false,
    publicComplaints: false,
    brandVerification: true,
    autoModeration: false,
    twoFactorAuth: true,
    apiAccess: false,
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const featuresList = [
    {
      key: "aiAnalysis" as keyof typeof features,
      label: "AI-Powered Analysis",
      description: "Enable automatic AI analysis of complaints",
    },
    {
      key: "emailNotifications" as keyof typeof features,
      label: "Email Notifications",
      description: "Send email notifications to users",
    },
    {
      key: "pushNotifications" as keyof typeof features,
      label: "Push Notifications",
      description: "Enable browser push notifications",
    },
    {
      key: "publicComplaints" as keyof typeof features,
      label: "Public Complaints",
      description: "Allow public viewing of complaints",
    },
    {
      key: "brandVerification" as keyof typeof features,
      label: "Brand Verification",
      description: "Require verification for brand accounts",
    },
    {
      key: "autoModeration" as keyof typeof features,
      label: "Auto-Moderation",
      description: "Automatically moderate flagged content",
    },
    {
      key: "twoFactorAuth" as keyof typeof features,
      label: "Two-Factor Authentication",
      description: "Require 2FA for admin accounts",
    },
    {
      key: "apiAccess" as keyof typeof features,
      label: "API Access",
      description: "Enable third-party API access",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Feature Toggles</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enable or disable platform features
            </p>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-8 max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-xl shadow-sm divide-y divide-border">
          {featuresList.map((feature) => (
            <div
              key={feature.key}
              className="p-6 flex items-center justify-between hover:bg-muted/50 transition"
            >
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{feature.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              <ToggleSwitch
                checked={features[feature.key]}
                onChange={() => toggleFeature(feature.key)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold">
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}
