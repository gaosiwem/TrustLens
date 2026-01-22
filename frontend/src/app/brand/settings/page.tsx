"use client";

import BrandHeader from "@/components/brand/BrandHeader";
import BrandSettings from "./brandSettings";

export default function BrandSettingsPage() {
  return (
    <>
      <BrandHeader
        title="Settings & Brand Assets"
        subtitle="Manage your team, brand identity, and notification alerts"
      />
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <BrandSettings />
      </div>
    </>
  );
}
