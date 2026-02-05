"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import StandardLoader from "../StandardLoader";

interface ForecastPoint {
  monthsForward: number;
  score: number;
}

interface TrustForecastData {
  currentScore: number;
  trendDirection: "UP" | "DOWN" | "STABLE";
  forecast: ForecastPoint[];
  historyCount: number;
}

export default function TrustForecastWidget({ brandId }: { brandId: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState<TrustForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForecast() {
      if (!brandId || !session?.accessToken) return;
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await axios.get(`${apiUrl}/brands/${brandId}/forecast`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        setData(res.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          // Handled by FeatureGate ideally, but safety first
          setError("Upgrade to BUSINESS to unlock AI forecasting.");
        } else {
          setError("Unable to calculate forecast at this time.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchForecast();
  }, [brandId, session]);

  if (loading)
    return (
      <div className="h-40 flex items-center justify-center">
        <StandardLoader />
      </div>
    );
  if (error)
    return (
      <div className="h-40 flex items-center justify-center text-xs text-muted-foreground font-medium px-6 text-center">
        {error}
      </div>
    );
  if (!data || !data.forecast)
    return (
      <div className="h-40 flex items-center justify-center text-xs text-muted-foreground font-medium px-6 text-center">
        Insufficient data for AI projection.
      </div>
    );

  const trendIcon = {
    UP: <TrendingUp className="w-6 h-6 text-emerald-500" />,
    DOWN: <TrendingDown className="w-6 h-6 text-rose-500" />,
    STABLE: <Minus className="w-6 h-6 text-amber-500" />,
  }[data.trendDirection];

  const trendColor = {
    UP: "text-emerald-500",
    DOWN: "text-rose-500",
    STABLE: "text-amber-500",
  }[data.trendDirection];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shadow-inner`}
          >
            {trendIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-black ${trendColor} tracking-tighter`}
              >
                {data.trendDirection}WARD TREND
              </span>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Based on last {data.historyCount} data points
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black tracking-tighter text-foreground">
            {data.currentScore}
          </span>
          <p className="text-[9px] font-black text-primary uppercase tracking-widest">
            Current Score
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {data.forecast.map((point) => (
          <div
            key={point.monthsForward}
            className="p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group"
          >
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">
              +{point.monthsForward} Month
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tighter text-foreground">
                {point.score}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">
                pts
              </span>
            </div>
            <div className="mt-3 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${trendColor} bg-current transition-all duration-1000`}
                style={{ width: `${point.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
          <div className="flex gap-3 items-start mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">
                What does this mean?
              </h4>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                Our AI analyzes your historical performance—including response
                rates, customer ratings, and verification updates—to identify
                your momentum.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 ml-11">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-foreground/70 uppercase">
                The Trend
              </span>
              <p className="text-[10px] text-muted-foreground">
                Identifying if your reputation is currently growing or losing
                traction in the ecosystem.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-foreground/70 uppercase">
                The Projection
              </span>
              <p className="text-[10px] text-muted-foreground">
                A mathematical forecast of where you'll be in 90 days if your
                current habits continue.
              </p>
            </div>
          </div>
        </div>

        <p className="text-[9px] text-muted-foreground/60 leading-relaxed italic px-2 font-medium">
          Note: Projections are estimates based on linear regression. Real-world
          events like sudden crises or new certifications will override these
          models.
        </p>
      </div>
    </div>
  );
}
