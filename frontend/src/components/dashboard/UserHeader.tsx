"use client";

import { FC } from "react";
import DarkModeToggle from "../DarkModeToggle";
import UserProfileMenu from "../UserProfileMenu";
import { Menu } from "lucide-react";

interface UserHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

const UserHeader: FC<UserHeaderProps> = ({ title, subtitle, onMenuClick }) => {
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 lg:py-6">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-muted rounded-xl transition-colors border border-border/50"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight italic">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm font-medium text-muted-foreground mt-0.5 italic">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <DarkModeToggle />
          </div>
          <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
