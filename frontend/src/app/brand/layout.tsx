"use client";

import { useState } from "react";
import BrandSidebar from "../../components/brand/BrandSidebar";
import MobileNav from "../../components/MobileNav";

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <BrandSidebar />

      <main className="flex-1 flex flex-col overflow-x-hidden">{children}</main>
    </div>
  );
}
