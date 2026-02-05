"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import StandardLoader from "../StandardLoader";

interface MetricCardProps {
  id: string;
  label: string;
  value: string | number;
  sublabel: string;
  icon: any;
  explanation: string;
  color: string;
  activeId: string | null;
  onHover: (id: string | null, explanation?: string) => void;
}

function MetricCard({
  id,
  label,
  value,
  sublabel,
  icon: Icon,
  explanation,
  color,
  activeId,
  onHover,
}: MetricCardProps) {
  const isHovered = activeId === id;

  const colorClasses: Record<string, any> = {
    emerald: {
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/10",
      text: "text-emerald-600",
      subtext: "text-emerald-600/70",
      hoverBorder: "hover:border-emerald-500/30",
      hoverShadow: "hover:shadow-emerald-500/5",
      accent: "text-emerald-600",
    },
    violet: {
      bg: "bg-violet-500/5",
      border: "border-violet-500/10",
      text: "text-violet-600",
      subtext: "text-violet-600/70",
      hoverBorder: "hover:border-violet-500/30",
      hoverShadow: "hover:shadow-violet-500/5",
      accent: "text-violet-600",
    },
    amber: {
      bg: "bg-amber-500/5",
      border: "border-amber-500/10",
      text: "text-amber-600",
      subtext: "text-amber-600/70",
      hoverBorder: "hover:border-amber-500/30",
      hoverShadow: "hover:shadow-amber-500/5",
      accent: "text-amber-600",
    },
    muted: {
      bg: "bg-muted/30",
      border: "border-border",
      text: "text-muted-foreground",
      subtext: "text-muted-foreground",
      hoverBorder: "hover:border-primary/30",
      hoverShadow: "hover:shadow-primary/5",
      accent: "text-primary",
    },
  };

  const style = colorClasses[color] || colorClasses.muted;

  return (
    <div
      className={[
        "p-4 rounded-2xl",
        style.bg,
        style.border,
        "border flex flex-col justify-between",
        "transition-all duration-300 cursor-default hover:-translate-y-1",
        style.hoverBorder,
        style.hoverShadow,
        "relative",
        isHovered ? "z-30" : "z-10",
      ].join(" ")}
      onMouseEnter={() => onHover(id, explanation)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center gap-2 text-[10px] font-bold ${style.text} uppercase`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>

        <span
          className={`material-symbols-outlined text-[14px] transition-all duration-300 ${
            isHovered ? style.accent + " scale-110" : "text-muted-foreground/40"
          }`}
        >
          info
        </span>
      </div>

      <div className="mt-2">
        <div className={`text-2xl font-black ${style.text}`}>{value}</div>
        <div className={`text-[9px] ${style.subtext} font-bold uppercase mt-1`}>
          {sublabel}
        </div>
      </div>
    </div>
  );
}

export default function BrandAuditWidget({ brandId }: { brandId: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [tooltipText, setTooltipText] = useState<string>("");

  useEffect(() => {
    async function fetchAudit() {
      if (!brandId || !session?.accessToken) return;
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await axios.get(
          `${apiUrl}/brands/${brandId}/audit/latest`,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          },
        );
        setData(res.data.auditData);
      } catch (err: any) {
        console.error("Audit fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAudit();
  }, [brandId, session]);

  const handleHover = (id: string | null, explanation?: string) => {
    setActiveId(id);
    setTooltipText(id ? explanation || "" : "");
  };

  if (loading)
    return (
      <div className="h-64 flex items-center justify-center">
        <StandardLoader />
      </div>
    );
  if (!data) return null;

  const { metrics } = data;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
            Health Ecosystem
          </h3>
          <p className="text-[9px] font-bold text-muted-foreground uppercase">
            90-Day Performance Audit
          </p>
        </div>
      </div>

      {/* Tooltip lane. Reserved space so it never overlaps anything */}
      <div className="min-h-[44px]">
        <AnimatePresence mode="wait" initial={false}>
          {tooltipText ? (
            <motion.div
              key={activeId || "tip"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.16 }}
              className="rounded-xl border border-border bg-popover text-popover-foreground px-3 py-2 text-[10px] font-bold leading-relaxed"
            >
              {tooltipText}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="text-[10px] font-bold text-muted-foreground/70"
            >
              Hover a metric to see what it means.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        <MetricCard
          id="vol"
          label="Volume"
          value={metrics.totalComplaints}
          sublabel="Total Disputes"
          icon={BarChart3}
          explanation="Total volume of complaints filed against your brand in the last 90 days."
          color="muted"
          activeId={activeId}
          onHover={handleHover}
        />

        <MetricCard
          id="res"
          label="Resolved"
          value={`${metrics.resolutionRate.toFixed(1)}%`}
          sublabel="Resolution Rate"
          icon={CheckCircle2}
          explanation="The percentage of disputes successfully closed relative to total complaints received."
          color="emerald"
          activeId={activeId}
          onHover={handleHover}
        />

        <MetricCard
          id="sen"
          label="Sentiment"
          value={`${(metrics.avgSentimentScore * 100).toFixed(0)}%`}
          sublabel="Net Positivity"
          icon={TrendingUp}
          explanation="AI-calculated average sentiment score across all interactions, normalized to 100%."
          color="violet"
          activeId={activeId}
          onHover={handleHover}
        />

        <MetricCard
          id="tim"
          label="Response"
          value={`${metrics.avgResponseTimeHours.toFixed(1)}h`}
          sublabel="Avg Lead Time"
          icon={Clock}
          explanation="Average hours taken from complaint creation to the first meaningful resolution action."
          color="amber"
          activeId={activeId}
          onHover={handleHover}
        />
      </div>

      <div className="pt-2">
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-1000"
            style={{ width: `${Math.min(100, metrics.resolutionRate)}%` }}
          />
        </div>
        <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase text-center tracking-tighter">
          Overall Health Index:{" "}
          <span className="text-emerald-500">
            {(
              metrics.resolutionRate * 0.7 +
              metrics.avgSentimentScore * 30
            ).toFixed(1)}
            /100
          </span>
        </p>
      </div>
    </div>
  );
}
