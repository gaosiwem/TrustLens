"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Loader2, FileText, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function AdminVerificationQueue() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = (session as any)?.accessToken;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/verified/admin/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      const token = (session as any)?.accessToken;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/verified/admin/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id, action }),
        }
      );

      if (res.ok) {
        toast.success(`Request ${action}d successfully`);
        setRequests((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error("Failed to process request");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold italic tracking-tighter underline decoration-primary decoration-4 underline-offset-8">
          Pending Verification Queue
        </h2>
        <span className="bg-primary/10 text-primary text-xs font-black px-2 py-1 rounded-full border border-primary/20">
          {requests.length} Requests
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="p-20 rounded-[3rem] bg-muted/20 border border-dashed border-border text-center">
          <CheckCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium italic">
            Queue is clear. All brands have been processed.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-1">
                <h4 className="text-lg font-black tracking-tight">
                  {req.brand?.name}
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                  Requested by:{" "}
                  <span className="text-foreground">{req.user?.email}</span>
                </p>

                {req.brand?.subscription?.plan ? (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-[9px] font-black tracking-widest text-primary">
                      {req.brand.subscription.plan.code.replace(/_/g, " ")}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[9px] font-black tracking-widest text-amber-600 dark:text-amber-400">
                      Payment Pending
                    </span>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  {(req.documents as any[])?.map((doc: any, idx: number) => {
                    const docUrl =
                      typeof doc === "string"
                        ? null
                        : `${
                            process.env.NEXT_PUBLIC_API_URL ||
                            "http://localhost:4000"
                          }${doc.path}`;

                    return (
                      <a
                        key={idx}
                        href={docUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-[10px] font-black tracking-widest hover:bg-primary/10 hover:text-primary transition-colors border border-border"
                      >
                        <FileText className="h-3 w-3" />
                        {typeof doc === "string"
                          ? doc
                          : doc.type?.replace(/_/g, " ") || `Doc ${idx + 1}`}
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Button
                  onClick={() => handleAction(req.id, "approve")}
                  className="flex-1 md:flex-none rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black gap-2 h-12 px-6"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAction(req.id, "reject")}
                  className="flex-1 md:flex-none rounded-2xl border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 font-black gap-2 h-12 px-6"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
