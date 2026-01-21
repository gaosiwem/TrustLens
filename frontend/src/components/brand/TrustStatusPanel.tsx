"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { ShieldCheck, ShieldAlert, Shield, Info } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

export default function TrustStatusPanel({ brandId }: { brandId: string }) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<any>(null);
  const [enforcements, setEnforcements] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrust = async () => {
      if (!session?.accessToken || !brandId) return;
      try {
        const [trustRes, enfRes] = await Promise.all([
          axios.get(`${API_URL}/brands/${brandId}/trust-score`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          axios.get(`${API_URL}/brands/${brandId}/enforcements`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
        ]);
        setStatus(trustRes.data);
        setEnforcements(enfRes.data);
      } catch (error) {
        console.error("Failed to fetch brand trust status:", error);
      }
    };
    fetchTrust();
  }, [session?.accessToken, brandId]);

  if (!status) return null;

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "LOW":
        return <ShieldCheck className="h-12 w-12 text-success" />;
      case "MEDIUM":
        return <Shield className="h-12 w-12 text-info" />;
      case "HIGH":
        return <ShieldAlert className="h-12 w-12 text-warning" />;
      case "CRITICAL":
        return <ShieldAlert className="h-12 w-12 text-error" />;
      default:
        return <Info className="h-12 w-12 text-muted-foreground" />;
    }
  };

  return (
    <div className="card-base p-0 overflow-hidden">
      <div className="p-6 bg-muted/20 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-background p-3 rounded-2xl border border-border">
            {getRiskIcon(status.riskLevel)}
          </div>
          <div>
            <h3 className="heading-3">Trust Enforcement Status</h3>
            <p className="text-sm text-muted-foreground font-medium">
              Platform-level integrity score
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm text-muted-foreground uppercase tracking-widest font-black">
            Score
          </span>
          <p className="text-3xl font-black italic">{status.score}/100</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {enforcements.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-bold text-error uppercase tracking-widest flex items-center gap-1">
              <Info className="h-3 w-3" /> Active Enforcement Actions
            </p>
            {enforcements.map((enf) => (
              <div
                key={enf.id}
                className="p-4 rounded-xl bg-error/5 border border-error/20 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-sm">{enf.actionType}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {enf.reason}
                  </p>
                </div>
                <span className="badge-base bg-error/10 text-error">
                  PENDING REVIEW
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-primary/5 border border-dashed border-primary/20 rounded-2xl">
            <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-3 opacity-50" />
            <p className="font-bold text-foreground/80 italic">
              Account in Good Standing
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Keep resolving complaints to maintain your trust score.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border">
            <p className="text-[10px] font-black uppercase text-muted-foreground">
              Risk Level
            </p>
            <p className="font-bold mt-1 text-sm">{status.riskLevel}</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border">
            <p className="text-[10px] font-black uppercase text-muted-foreground">
              Last Evaluated
            </p>
            <p className="font-bold mt-1 text-sm">
              {new Date(status.evaluatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
