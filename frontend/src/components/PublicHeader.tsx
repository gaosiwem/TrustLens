"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import DarkModeToggle from "./DarkModeToggle";

interface PublicHeaderProps {
  transparent?: boolean;
}

export default function PublicHeader({
  transparent = false,
}: PublicHeaderProps) {
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  return (
    <nav
      className={`border-b border-border sticky top-0 z-50 ${
        transparent
          ? "bg-background/80 backdrop-blur-md"
          : "bg-card/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">
                shield
              </span>
              <span className="text-xl font-black tracking-tighter">
                TrustLens
              </span>
            </Link>
            <Link
              href="/complaints"
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors hidden md:block"
            >
              Browse Complaints
            </Link>
            <Link
              href="/categories"
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors hidden md:block"
            >
              Categories
            </Link>
            <Link
              href="/brand/claim"
              className="text-sm font-bold text-primary hover:underline hidden md:block"
            >
              For Businesses
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="btn-base btn-primary px-6 py-2 rounded-xl font-bold shadow-lg text-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-base btn-primary px-4 py-2 rounded-xl font-bold shadow-lg text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
