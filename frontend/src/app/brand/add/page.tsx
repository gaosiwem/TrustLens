"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import BrandClaimForm from "../../../components/BrandClaimForm";
import Link from "next/link";
import BrandHeader from "../../../components/brand/BrandHeader";

export default function AddBrandPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (status === "loading") return;

      // Not logged in - redirect to claim
      if (!session) {
        router.replace("/brand/claim");
        return;
      }

      // Not a BRAND user - redirect to claim
      if ((session.user as any)?.role !== "BRAND") {
        router.replace("/brand/claim");
        return;
      }

      // Check if user has claimed any brands yet
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await axios.get(`${apiUrl}/dashboard`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        const managedBrands = res.data.managedBrands || [];

        // If no brands claimed yet, redirect to claim page
        if (managedBrands.length === 0) {
          router.replace("/brand/claim");
          return;
        }

        // User has brands, allow access to add more
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking brand status:", error);
        // On error, redirect to claim as fallback
        router.replace("/brand/claim");
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [session, status, router]);

  if (status === "loading" || checking || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="mt-4 text-sm font-bold tracking-widest text-muted-foreground uppercase animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <>
      <BrandHeader
        title="Add Another Brand"
        subtitle="Expand your portfolio by claiming additional brands"
        onMenuClick={() => {}}
      />

      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="max-w-2xl w-full text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
            <span className="material-symbols-outlined text-lg">verified</span>
            Verified Brand Manager
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Claim Another Brand
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            As an existing verified brand manager, you can claim additional
            brands to manage from a single account. Your new claim will be
            reviewed by our team.
          </p>
        </div>

        <BrandClaimForm />

        <div className="mt-8 text-center">
          <Link
            href="/brand/dashboard"
            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">
              arrow_back
            </span>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
