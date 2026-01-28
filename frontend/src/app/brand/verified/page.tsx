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
import {
  Loader2,
  AlertCircle,
  Calendar,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../../../components/ui/dialog";
import { cn } from "../../../lib/utils";
import BrandHeader from "../../../components/brand/BrandHeader";
import { MetricCard } from "../../../components/brand/MetricCard";
import StandardLoader from "../../../components/StandardLoader";

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
    return <StandardLoader fullPage />;
  }

  const isExpired =
    subscription?.status === "expired" ||
    (subscription?.verifiedUntil &&
      new Date(subscription.verifiedUntil) < new Date());

  const isApproved =
    subscription?.status === "approved" &&
    !isExpired &&
    !!subscription?.verifiedUntil;

  const isPending = subscription?.status === "pending";
  const isMoreInfo = subscription?.status === "more_info";
  const hasPaid =
    subscription?.status === "paid_pending" ||
    isApproved ||
    isPending ||
    isMoreInfo;

  const getStatusLabel = () => {
    if (isExpired) return "Verification Expired";
    if (subscription?.status === "approved" && !subscription?.verifiedUntil)
      return "Payment Required";

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
  const isPaymentRequired = statusLabel === "Payment Required";

  const showUploadHeader =
    hasPaid && (!documents.length || subscription?.status === "more_info");

  // New User State: No Subscription AND No Prior Application Status
  // Only show landing page if they truly have no history
  const isNewUser =
    (!subscription || subscription.status === "not_started") &&
    !hasPaid &&
    !isExpired;

  if (isNewUser) {
    return (
      <>
        <BrandHeader
          title="Verification Center"
          subtitle="Identity Verification & Trust Authority"
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto space-y-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">
            Become a <span className="text-primary italic">Verified Brand</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Unlock the verified badge, premium analytics, and trusted status.
            Our streamlined process combines subscription and identity
            verification in one step.
          </p>

          <div className="grid gap-4 w-full max-w-md">
            <Link href="/brand/verified/subscribe">
              <Button className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 rounded-2xl">
                Start Verification
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Includes annual re-validation • Cancel anytime
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BrandHeader
        title="Verification Center"
        subtitle="Manage your business identity and verified authority"
        onMenuClick={() => setMobileNavOpen(true)}
      />

      <div className="p-4 sm:p-8 space-y-8">
        {/* Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="heading-2 font-bold flex items-center gap-3">
              {showUploadHeader
                ? "Complete Your Verification"
                : "Status Overview"}
              {isApproved && subscription?.verifiedUntil && (
                <VerifiedBadge verifiedUntil={subscription.verifiedUntil} />
              )}
            </h2>
            <p className="text-small text-muted-foreground mt-1">
              {showUploadHeader
                ? "Upload the required documents to finalize your application."
                : "Monitor your verification status and subscription details"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/brand/verified/analytics">
              <Button
                variant="outline"
                className="btn-base btn-secondary border-2"
              >
                View Impact
              </Button>
            </Link>
            {!hasPaid && !isExpired && (
              <Link href="/brand/verified/subscribe">
                {/* Fallback if logic slips into this state */}
                <Button className="btn-base btn-primary h-12 shadow-xl shadow-primary/20">
                  {isPaymentRequired
                    ? "Complete Payment"
                    : "Purchase Subscription"}
                </Button>
              </Link>
            )}

            {hasPaid && !isApproved && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-10 px-6 font-semibold shadow-sm rounded-lg">
                    Complete Verification
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Required Documents</DialogTitle>
                    <DialogDescription>
                      Upload active business credentials to finalize your
                      identity verification.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
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
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Current Status"
            value={statusLabel}
            icon={ShieldCheck}
            gradient="from-primary to-primary/80"
          />

          <MetricCard
            title="Valid Until"
            value={
              subscription?.verifiedUntil
                ? new Date(subscription.verifiedUntil).toLocaleDateString()
                : isPending ||
                    subscription?.status === "paid_pending" ||
                    isMoreInfo
                  ? "Pending Approval"
                  : isPaymentRequired
                    ? "Waiting for Payment"
                    : "Not Active"
            }
            icon={Calendar}
            gradient="from-primary/60 to-primary/40"
          />

          <MetricCard
            title="Next Renewal"
            value={
              subscription?.renewalDate
                ? new Date(subscription.renewalDate).toLocaleDateString()
                : isPending ||
                    subscription?.status === "paid_pending" ||
                    isMoreInfo
                  ? "Pending Approval"
                  : "Not Active"
            }
            icon={RefreshCcw}
            gradient="from-primary/60 to-primary/40"
          />
        </div>

        {/* Status / Action Banner (Matches Dashboard's AI Insight Style) */}
        <div className="p-8 rounded-4xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl transition-colors group-hover:bg-primary/10 duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <span className="material-symbols-outlined text-white text-3xl">
                {isApproved
                  ? "verified_user"
                  : isExpired
                    ? "history_toggle_off"
                    : isPaymentRequired
                      ? "credit_card"
                      : "pending_actions"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black mb-1">
                {isApproved
                  ? "Verification Active"
                  : isExpired
                    ? "Subscription Expired"
                    : isPaymentRequired
                      ? "Approval Complete - Payment Needed"
                      : "Identity Review"}
              </h3>
              <p className="text-foreground/80 leading-relaxed font-medium italic">
                "
                {isApproved
                  ? "Your business identity is fully verified. You now have access to premium analytics and the verified badge."
                  : isExpired
                    ? "Your verification has expired. Renew now to restore your verified badge and maintain customer trust."
                    : isMoreInfo
                      ? "Our team needs more information to complete your verification. Please check your email or contact support."
                      : isPaymentRequired
                        ? "Great news! Your identity documents have been approved. To activate your verified badge and analytics dashboard, please complete your subscription payment."
                        : "Your verification is currently being processed. Once approved, you will need to activate your subscription."}
                "
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-primary bg-primary/10 px-2 py-1 rounded">
                  Internal Status: {statusLabel}
                </span>
              </div>
            </div>
            {isExpired && (
              <Link href="/brand/verified/subscribe">
                <Button className="btn-base btn-primary shadow-xl shadow-primary/20 shrink-0">
                  Renew Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
