"use client";

import { useState } from "react";
import { getBrandInitials, getBrandColor, cn, getAssetUrl } from "../lib/utils";

interface BrandLogoProps {
  brandName: string;
  brandLogoUrl?: string | null;
  className?: string;
}

export function BrandLogo({
  brandName,
  brandLogoUrl,
  className,
}: BrandLogoProps) {
  const [logoError, setLogoError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const initials = getBrandInitials(brandName);
  const bgColor = getBrandColor(brandName);

  if (!brandLogoUrl || logoError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg font-bold text-white shrink-0 overflow-hidden shadow-sm",
          className || "w-12 h-12 text-base",
        )}
        style={{ backgroundColor: bgColor }}
        title={brandName}
      >
        {initials}
      </div>
    );
  }

  // Handle relative URLs from backend
  const finalSrc = getAssetUrl(brandLogoUrl);

  return (
    <div
      className={cn(
        "relative rounded-lg shrink-0 shadow-sm overflow-hidden",
        className || "w-12 h-12",
      )}
    >
      {/* Placeholder / Shimmer while loading */}
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center font-bold text-white bg-muted animate-pulse"
          style={{ backgroundColor: !logoError ? bgColor : undefined }}
        >
          {initials}
        </div>
      )}

      <img
        src={finalSrc}
        alt={brandName}
        className={cn(
          "w-full h-full object-contain bg-white transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setLogoError(true)}
      />
    </div>
  );
}

export default BrandLogo;
