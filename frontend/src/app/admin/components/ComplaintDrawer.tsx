"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import BrandLogo from "../../../components/BrandLogo";

interface ComplaintDrawerProps {
  complaint: any;
  onClose: () => void;
  onUpdate?: () => void;
}

const STATUS_OPTIONS = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "NEEDS_INFO",
  "RESPONDED",
  "RESOLVED",
  "REJECTED",
];

export default function ComplaintDrawer({
  complaint,
  onClose,
  onUpdate,
}: ComplaintDrawerProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (complaint) setStatus(complaint.status);
  }, [complaint]);

  if (!complaint) return null;

  const handleUpdateStatus = async () => {
    if (!session?.accessToken || updating) return;
    setUpdating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      await axios.patch(
        `${apiUrl}/complaints/${complaint.id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      );
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={!!complaint} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandLogo
                brandName={complaint.brandName}
                brandLogoUrl={complaint.brandLogoUrl}
                className="w-16 h-16 rounded-xl object-contain bg-white border border-border shadow-sm"
              />
              <span>{complaint.brandName}</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground mr-8">
              #{complaint.id.slice(0, 8)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">
                Operational Status
              </p>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">
                Submission Date
              </p>
              <p className="text-sm py-2">
                {new Date(complaint.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">
              AI Risk Audit
            </p>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${
                      complaint.verifiedTier === 1
                        ? 90
                        : complaint.verifiedTier === 2
                        ? 60
                        : 30
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs font-bold">
                Tier {complaint.verifiedTier || 3}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on attachment cross-referencing and sentiment consistency.
              Tier 1 indicates high probability of genuine grievance.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={updating || status === complaint.status}
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {updating ? "Saving..." : "Update Lifecycle"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
