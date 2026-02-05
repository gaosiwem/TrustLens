"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import BrandSidebar from "../../components/brand/BrandSidebar";
import MobileNav from "../../components/MobileNav";

// Pages that don't require claimed brands
const EXEMPT_PATHS = ["/brand/claim", "/brand/verification-pending"];

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasClaimedBrands, setHasClaimedBrands] = useState(false);

  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Check if current path is exempt from brand claim requirement
  const isExemptPath = EXEMPT_PATHS.some((path) => pathname?.startsWith(path));

  useEffect(() => {
    const checkBrandStatus = async () => {
      // Skip check for exempt paths or while loading session
      if (isExemptPath || status === "loading") {
        setChecking(false);
        return;
      }

      // No session - let individual pages handle auth
      if (!session?.accessToken) {
        setChecking(false);
        return;
      }

      // Note: We don't return early if role is not BRAND, because it might be
      // a newly approved user whose session role hasn't updated yet.
      // The dashboard API will tell us if they have managed brands.

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await axios.get(`${apiUrl}/dashboard`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        const managedBrands = res.data.managedBrands || [];
        const hasPendingClaim = res.data.hasPendingClaim;

        if (managedBrands.length > 0) {
          // User has claimed brands - allow access
          setHasClaimedBrands(true);
          setChecking(false);
        } else if (hasPendingClaim) {
          // User has pending claim - redirect to pending page
          router.replace("/brand/verification-pending");
        } else {
          // User hasn't claimed any brand - redirect to claim
          router.replace("/brand/claim");
        }
      } catch (error: any) {
        console.error("Error checking brand status:", error);
        // Do NOT redirect on actual errors (429, 500) to avoid loops
        // Only set checking false so the children can try to render/handle it
        setChecking(false);
      }
    };

    checkBrandStatus();
  }, [session, status, pathname, isExemptPath, router]);

  // Show loading while checking (except for exempt paths)
  if (!isExemptPath && (status === "loading" || checking)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // For exempt paths (claim, verification-pending), render without sidebar
  if (isExemptPath) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <BrandSidebar />

      <main className="flex-1 flex flex-col overflow-x-hidden">{children}</main>
    </div>
  );
}
