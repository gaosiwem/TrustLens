"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
// Removed unused Table imports
import { Badge } from "../ui/badge";
import { TrendingDown, Target, Sword, AlertTriangle, Lock } from "lucide-react";
import { useSubscription } from "../../context/SubscriptionContext";
import { Button } from "../ui/button";
import Link from "next/link";
// Removed Tooltip imports

interface Vulnerability {
  competitorName: string;
  weakness: string;
  volume: number;
  opportunity: string;
}

export function CompetitorScanningWidget() {
  const params = useParams();
  const brandId = params.id as string;
  const { features } = useSubscription(); // Use features object
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAccess = features?.["historicalBenchmarking"]; // Grouped with benchmarking

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/analysis/competitors`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setVulnerabilities(data);
        }
      } catch (error) {
        console.error("Failed to fetch competitor analysis", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [brandId, hasAccess]);

  if (!hasAccess) {
    return (
      <Card className="h-full border border-dashed relative overflow-hidden bg-muted/20">
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-bold text-lg mb-2">
            Competitor Vulnerability Scanning
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">
            Unlock "Offensive Intelligence" on the Business Plan. See exactly
            where your rivals are failing.
          </p>
          <Link href="/brand/pricing">
            <Button>Upgrade to Reveal</Button>
          </Link>
        </div>
        <CardHeader>
          <CardTitle>Market Opportunities</CardTitle>
          <CardDescription>Track rival weaknesses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 filter blur-sm">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg bg-card"
              >
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sword className="w-5 h-5 text-red-500" />
              Top Market Opportunities
            </CardTitle>
            <CardDescription>
              Capitalize on these top ranked competitor weaknesses.
            </CardDescription>
          </div>
          <div title="Scans competitor sentiment in real-time.">
            <Badge variant="outline" className="text-xs cursor-help">
              Live Scan
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg w-full" />
            ))}
          </div>
        ) : vulnerabilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground bg-muted/10 rounded-lg">
            <Target className="w-10 h-10 mb-3 opacity-20" />
            <p>No major competitor vulnerabilities detected yet.</p>
            <p className="text-xs mt-1">
              Your rivals seem to be performing well this week.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {vulnerabilities.map((v, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 p-3 rounded-lg border bg-linear-to-r from-red-50/50 to-transparent hover:from-red-50 hover:to-red-50/20 transition-colors"
                title={`${v.volume} negative complaints`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-red-600">#{idx + 1}</span>
                    <span>{v.competitorName}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 text-xs font-normal"
                  >
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    {v.weakness}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium text-foreground text-xs">
                    opportunity:
                  </span>
                  <span className="italic text-xs">{v.opportunity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
