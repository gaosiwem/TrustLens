"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { ComplaintSentimentSnapshot } from "@/types/sentiment";
import { sentimentColorClass, sentimentLabelPretty } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function ComplaintSentimentPanel({
  complaintId,
}: {
  complaintId: string;
}) {
  const [snapshot, setSnapshot] = useState<ComplaintSentimentSnapshot | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ snapshot: ComplaintSentimentSnapshot }>(
      `/api/brand/complaints/${complaintId}/sentiment`,
    )
      .then((res) => setSnapshot(res.snapshot))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [complaintId]);

  if (loading) return <Skeleton className="w-full h-[140px] rounded-xl" />;
  if (!snapshot) return null;

  const urgencyColor =
    snapshot.currentUrgency > 70
      ? "text-red-500"
      : snapshot.currentUrgency > 40
        ? "text-yellow-500"
        : "text-emerald-500";

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">AI Sentiment Analysis</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "px-3 py-1 font-semibold",
              sentimentColorClass(snapshot.currentLabel),
            )}
          >
            {sentimentLabelPretty(snapshot.currentLabel)}
          </Badge>
        </div>
        <CardDescription>
          Last updated {new Date(snapshot.lastEventAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Score
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{
                    width: `${((snapshot.currentScore + 1) / 2) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-bold">
                {snapshot.currentScore.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              AI Urgency
            </span>
            <div className="flex items-center gap-2">
              <AlertCircle className={cn("w-4 h-4", urgencyColor)} />
              <span className={cn("text-lg font-bold", urgencyColor)}>
                {snapshot.currentUrgency}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Key Topics
            </span>
            <div className="flex flex-wrap gap-1">
              {snapshot.topics.slice(0, 3).map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 capitalize"
                >
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
