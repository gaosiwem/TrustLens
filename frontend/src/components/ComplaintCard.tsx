"use client";
import { Badge } from "./ui/badge";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { BadgeCheck } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface ComplaintCardProps {
  id: string;
  brand: string;
  brandId?: string; // NEW
  brandLogoUrl?: string;
  isVerified?: boolean;
  verifiedUntil?: string | null;
  status: string;
  description: string;
  createdAt: string;
  onClick: (id: string) => void;
  isActive?: boolean;
}

export function ComplaintCard({
  id,
  brand,
  brandId, // NEW
  brandLogoUrl,
  isVerified,
  verifiedUntil,
  status,
  description,
  createdAt,
  onClick,
  isActive,
}: ComplaintCardProps) {
  const handleBadgeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (brandId) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/brands/${brandId}/badge-click`,
          { method: "POST" },
        );
        window.location.href = "/verified-explained";
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div
      className={`p-4 rounded-xl shadow cursor-pointer transition-all border-2 ${
        isActive
          ? "bg-muted shadow-lg border-primary"
          : "bg-white dark:bg-[#1a2c34] hover:shadow-lg border-transparent"
      }`}
      onClick={() => onClick(id)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {brandId ? (
            <Link
              href={`/brand/${brandId}`}
              onClick={(e) => e.stopPropagation()}
            >
              <BrandLogo
                brandName={brand}
                brandLogoUrl={brandLogoUrl}
                className="w-14 h-14 rounded-2xl object-contain bg-white border border-border shadow-sm"
              />
            </Link>
          ) : (
            <BrandLogo
              brandName={brand}
              brandLogoUrl={brandLogoUrl}
              className="w-14 h-14 rounded-2xl object-contain bg-white border border-border shadow-sm"
            />
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {brandId ? (
                <Link
                  href={`/brand/${brandId}`}
                  className="font-bold text-lg hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {brand}
                </Link>
              ) : (
                <h3 className="font-bold text-lg">{brand}</h3>
              )}

              {isVerified &&
                (!verifiedUntil || new Date(verifiedUntil) > new Date()) && (
                  <div
                    onClick={handleBadgeClick}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    title="Verified Brand - Click to learn more"
                  >
                    <BadgeCheck className="w-5 h-5 text-white fill-primary" />
                  </div>
                )}
            </div>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="text-sm text-[#637588] dark:text-[#93a2b7] line-clamp-2">
        {description}
      </p>
      <span className="text-xs text-[#93a2b7] dark:text-[#637588] mt-2 block">
        {new Date(createdAt).toLocaleDateString()}
      </span>
    </div>
  );
}

export default ComplaintCard;
