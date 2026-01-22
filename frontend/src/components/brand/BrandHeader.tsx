"use client";

import { useState } from "react";
import DarkModeToggle from "../DarkModeToggle";
import UserProfileMenu from "../UserProfileMenu";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import BrandBell from "./BrandBell";

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function BrandHeader({
  title,
  subtitle,
  onMenuClick,
}: BrandHeaderProps) {
  const { data: session } = useSession();
  const brandId = (session as any)?.user?.brandId;
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="heading-1 text-2xl sm:text-3xl tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-caption text-muted-foreground mt-0.5 font-medium italic">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1">
            {(brandId || session?.user?.id) && (
              <BrandBell brandId={brandId} userId={session?.user?.id} />
            )}
          </div>

          <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

          <div className="flex items-center gap-2 sm:gap-4">
            <DarkModeToggle />
            <UserProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
