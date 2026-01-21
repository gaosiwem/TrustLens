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
    <img
      src={finalSrc}
      alt={brandName}
      className={cn(
        "rounded-lg object-contain bg-white shrink-0 shadow-sm",
        className || "w-12 h-12",
      )}
      onError={() => setLogoError(true)}
    />
  );
}

export default BrandLogo;
