"use client";

import { useState } from "react";
import DarkModeToggle from "../DarkModeToggle";
import UserProfileMenu from "../UserProfileMenu";
import { Menu, Bell } from "lucide-react";

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
            <button className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all relative group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-card" />
            </button>
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
