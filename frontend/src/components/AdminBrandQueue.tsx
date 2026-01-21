"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { getAssetUrl } from "../lib/utils";
import FilePreview from "./FilePreview";
import { Badge } from "./ui/badge";

export default function AdminBrandQueue() {
  const { data: session } = useSession();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

  const {
    data: claims,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["brandClaims"],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}/admin/brand-claims`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      return res.data;
    },
    enabled: !!session,
  });

  const handleAction = async (claimId: string, status: string) => {
    try {
      await axios.patch(
        `${apiUrl}/admin/brand-claims/${claimId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      refetch();
    } catch (error) {
      console.error("Action failed:", error);
      alert("Failed to update claim status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground font-bold tracking-widest">
          Loading Queue...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">
            error
          </span>
        </div>
        <p className="text-red-600 dark:text-red-400 font-bold text-lg">
          Failed to Load Brand Claim Verification Queue
        </p>
        <p className="text-sm text-muted-foreground">
          Unable to retrieve pending brand ownership verification requests.
          Please check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full p-8 bg-white dark:bg-[#1a2c34] rounded-2xl shadow-xl border border-border flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#111618] dark:text-white">
          Brand Verification Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and verify brand ownership applications.
        </p>
      </div>

      <div className="space-y-4">
        {claims?.length ? (
          claims.map((claim: any) => (
            <div
              key={claim.id}
              className="flex flex-col gap-6 p-6 rounded-2xl border border-border hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-black text-[#111618] dark:text-white">
                      {claim.brandName}
                    </p>
                    <Badge variant="outline" className="font-bold text-[10px]">
                      ID: #{claim.id.slice(0, 8)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-[#637588] dark:text-[#93a2b7] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      mail
                    </span>
                    {claim.email}
                  </p>
                  {claim.websiteUrl && (
                    <p className="text-sm font-medium text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        language
                      </span>
                      <a
                        href={
                          claim.websiteUrl.startsWith("http")
                            ? claim.websiteUrl
                            : `https://${claim.websiteUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {claim.websiteUrl}
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                    <span className="material-symbols-outlined text-sm text-blue-600 dark:text-blue-400">
                      auto_awesome
                    </span>
                    <span className="text-xs font-black text-blue-700 dark:text-blue-300 tracking-tighter">
                      AI Score: {claim.aiScore}%
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-widest">
                    Confidence Metric
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-muted-foreground tracking-widest mb-3">
                  Verification Evidence
                </p>
                <div className="flex flex-col gap-2">
                  {claim.documents && claim.documents.length > 0 ? (
                    claim.documents.map((docPath: string, i: number) => {
                      const fileName = docPath.split("/").pop() || "document";
                      const fileUrl = getAssetUrl(docPath);
                      return (
                        <a
                          key={i}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline group w-fit"
                        >
                          <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">
                            attachment
                          </span>
                          <span className="truncate max-w-[300px] font-medium">
                            {fileName}
                          </span>
                        </a>
                      );
                    })
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      No documents provided
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => handleAction(claim.id, "APPROVED")}
                  className="btn-success flex items-center gap-2 text-xs font-bold px-4 py-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    verified
                  </span>
                  Approve Claim
                </button>
                <button
                  onClick={() => handleAction(claim.id, "INFO_REQUESTED")}
                  className="btn-warning flex items-center gap-2 text-xs font-bold px-4 py-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    info
                  </span>
                  Request Info
                </button>
                <button
                  onClick={() => handleAction(claim.id, "REJECTED")}
                  className="btn-danger flex items-center gap-2 text-xs font-bold px-4 py-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    block
                  </span>
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-border rounded-3xl">
            <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">
              inbox
            </span>
            <p className="text-muted-foreground font-bold">
              No pending brand claims
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
