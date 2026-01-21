"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getVerificationStatus,
  getVerificationDocuments,
  uploadVerificationDocument,
} from "../../../api/verification.api";
import {
  VerificationSubscription,
  VerificationDocument,
} from "../../../types/verification";
import VerifiedBadge from "../../../components/subscription/VerifiedBadge";
import DocumentUploadItem from "../../../components/verification/DocumentUploadItem";
import { Button } from "../../../components/ui/button";
import { Loader2, AlertCircle, Calendar, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "../../../lib/utils";
import BrandHeader from "../../../components/brand/BrandHeader";

const REQUIRED_DOCS = [
  "business_registration",
  "director_id",
  "proof_of_address",
];

export default function VerificationDashboard() {
  const { data: session } = useSession();
  const [subscription, setSubscription] =
    useState<VerificationSubscription | null>(null);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      loadData();
    }
  }, [session?.accessToken]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusData, docsData] = await Promise.all([
        getVerificationStatus(session!.accessToken as string),
        getVerificationDocuments(session!.accessToken as string),
      ]);
      setSubscription(statusData);
      setDocuments(docsData);
    } catch (error) {
      console.error("Failed to load verification data", error);
      toast.error("Failed to load verification data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (type: string, file: File) => {
    try {
      setUploading(type);
      await uploadVerificationDocument(
        session!.accessToken as string,
        type,
        file,
      );
      toast.success(`${type.replace(/_/g, " ")} uploaded successfully`);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusLabel = () => {
    switch (subscription?.status) {
      case "paid_pending":
        return "Paid - Pending Review";
      case "pending":
        return "Pending Approval";
      case "approved":
        return "Verified";
      case "rejected":
        return "Verification Rejected";
      case "expired":
        return "Verification Expired";
      case "not_started":
        return "Not Started";
      case "more_info":
        return "More Information Required";
      default:
        return (subscription?.status || "not_started").replace(/_/g, " ");
    }
  };

  const statusLabel = getStatusLabel();
  const isApproved = subscription?.status === "approved";
  const isExpired = subscription?.status === "expired";
  const isPending = subscription?.status === "pending";
  const isMoreInfo = subscription?.status === "more_info";
  const hasPaid =
    subscription?.status === "paid_pending" ||
    isApproved ||
    isPending ||
    isMoreInfo;

  return (
    <>
      <BrandHeader
        title="Verification Center"
        subtitle="Manage your business identity and verified authority"
        onMenuClick={() => setMobileNavOpen(true)}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <Link
          href="/brand/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8 w-fit"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Overview
        </Link>

        {/* Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Status <span className="text-primary italic">Overview</span>
              {isApproved && subscription?.verifiedUntil && (
                <VerifiedBadge verifiedUntil={subscription.verifiedUntil} />
              )}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/brand/verified/analytics">
              <Button
                variant="outline"
                className="h-14 rounded-2xl px-8 font-black text-lg border-2"
              >
                View Impact
              </Button>
            </Link>
            {!hasPaid && !isExpired && (
              <Link href="/brand/verified/subscribe">
                <Button className="h-14 rounded-2xl px-8 font-black text-lg shadow-xl shadow-primary/20">
                  Purchase Subscription
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Status Overview Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col gap-4">
            <span className="text-[10px] font-black tracking-widest text-muted-foreground">
              Current Status
            </span>
            <div
              className={cn(
                "text-lg font-black italic tracking-tight truncate",
                isApproved
                  ? "text-emerald-500"
                  : subscription?.status === "paid_pending" || isMoreInfo
                    ? "text-amber-500"
                    : isExpired
                      ? "text-destructive"
                      : "text-primary",
              )}
            >
              {statusLabel}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col gap-4">
            <span className="text-[10px] font-black tracking-widest text-muted-foreground">
              Valid Until
            </span>
            <div className="text-lg font-black italic tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              {subscription?.verifiedUntil
                ? new Date(subscription.verifiedUntil).toLocaleDateString()
                : isPending ||
                    subscription?.status === "paid_pending" ||
                    isMoreInfo
                  ? "Pending Approval"
                  : "Not Active"}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col gap-4">
            <span className="text-[10px] font-black tracking-widest text-muted-foreground">
              Next Renewal
            </span>
            <div className="text-lg font-black italic tracking-tight flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-muted-foreground" />
              {subscription?.renewalDate
                ? new Date(subscription.renewalDate).toLocaleDateString()
                : isPending ||
                    subscription?.status === "paid_pending" ||
                    isMoreInfo
                  ? "Pending Approval"
                  : "Not Active"}
            </div>
          </div>
        </div>

        {/* Document Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black italic tracking-tighter underline underline-offset-8 decoration-primary decoration-4">
              Required Documents
            </h2>
            <span className="text-[10px] font-black tracking-widest bg-muted px-3 py-1 rounded-full border border-border">
              {documents.filter((d) => d.status === "approved").length} /{" "}
              {REQUIRED_DOCS.length} Verified
            </span>
          </div>

          <div className="grid gap-4">
            {REQUIRED_DOCS.map((type) => {
              const doc = documents.find((d) => d.type === type);
              return (
                <DocumentUploadItem
                  key={type}
                  type={type}
                  doc={doc}
                  onUpload={(file) => handleUpload(type, file)}
                  loading={uploading === type}
                />
              );
            })}
          </div>
        </div>

        {/* Expiry / Action required Section - Only show if not approved */}
        {!isApproved && (isExpired || (hasPaid && !isApproved)) && (
          <div className="mt-12 p-10 rounded-[3rem] bg-primary/5 border border-primary/20 text-center space-y-6">
            <AlertCircle className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-2xl font-black italic tracking-tighter">
              {isExpired ? "Subscription Expired" : "Verification in Progress"}
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto font-medium">
              {isExpired
                ? "Your verification has expired. Renew now to restore your verified badge and maintain customer trust."
                : isMoreInfo
                  ? "Our team needs more information to complete your verification. Please check your email or contact support."
                  : "Your verification is currently being processed. Once approved, your badge will automatically display on your profile."}
            </p>
            {isExpired && (
              <Link href="/brand/verified/subscribe">
                <Button
                  size="lg"
                  className="h-16 rounded-2xl px-10 font-black text-xl shadow-2xl shadow-primary/20"
                >
                  Renew Subscription
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
