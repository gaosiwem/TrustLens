"use client";

import { useState } from "react";
import UserSidebar from "../../components/dashboard/UserSidebar";
import UserHeader from "../../components/dashboard/UserHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-full">
        {/* We use a wrapper here because UserHeader is sticky, but we can also handle it inside */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
