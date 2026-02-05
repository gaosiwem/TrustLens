import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-out Menu */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Link href="/" onClick={onClose}>
            <img
              src="/logo.png"
              alt="TrustLens"
              className="h-8 w-auto hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex flex-col px-2 gap-1 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted transition"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link
            href="/complaints"
            className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted transition"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            {(session?.user as any)?.role === "BRAND"
              ? "Brand Complaints"
              : "Complaints"}
          </Link>
          {(session?.user as any)?.role !== "BRAND" && (
            <Link
              href="/ai-insights"
              className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted transition"
              onClick={onClose}
            >
              <span className="material-symbols-outlined">insights</span>
              AI Insights
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 py-3 px-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition font-bold"
              onClick={onClose}
            >
              <span className="material-symbols-outlined">
                admin_panel_settings
              </span>
              Admin Dashboard
            </Link>
          )}

          <div className="h-px bg-border my-2 mx-4" />

          {session && (
            <button
              onClick={() => {
                onClose();
                signOut({ callbackUrl: "/" });
              }}
              className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-red-500/10 text-red-500 transition text-left"
            >
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </button>
          )}
        </nav>
      </aside>
    </>
  );
}
