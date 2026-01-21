"use client";

import { FC } from "react";
import clsx from "clsx";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const SideDrawer: FC<Props> = ({ open, onClose }) => {
  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/" onClick={onClose}>
            <span className="font-bold text-xl hover:text-primary transition-colors cursor-pointer">
              TrustLens
            </span>
          </Link>
          <button
            className="text-muted-foreground p-1 hover:bg-muted rounded-lg transition"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex flex-col p-4 gap-2">
          <Link
            href="/complaints"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-xl">list_alt</span>
            {(session?.user as any)?.role === "BRAND"
              ? "Brand Complaints"
              : "My Complaints"}
          </Link>
          {(session?.user as any)?.role === "BRAND" && (
            <>
              <Link
                href="/brand/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                onClick={onClose}
              >
                <span className="material-symbols-outlined text-xl">
                  dashboard
                </span>
                Brand Dashboard
              </Link>
              <Link
                href="/brand/verified"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                onClick={onClose}
              >
                <span className="material-symbols-outlined text-xl">
                  verified
                </span>
                Verification Center
              </Link>
              <Link
                href="/brand/verified/analytics"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                onClick={onClose}
              >
                <span className="material-symbols-outlined text-xl">
                  insights
                </span>
                Impact Analytics
              </Link>
            </>
          )}
          {(session?.user as any)?.role !== "BRAND" && (
            <Link
              href="/complaints/create"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-xl">add_box</span>
              New Complaint
            </Link>
          )}
          {isAdmin && (
            <>
              <div className="h-px bg-border my-2" />
              <p className="px-3 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                Management
              </p>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-bold"
                onClick={onClose}
              >
                <span className="material-symbols-outlined text-xl">
                  admin_panel_settings
                </span>
                Admin Dashboard
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default SideDrawer;
