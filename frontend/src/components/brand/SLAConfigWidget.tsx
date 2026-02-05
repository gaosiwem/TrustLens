"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Clock, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { toast } from "sonner";
import StandardLoader from "../StandardLoader";

interface SLAConfig {
  lowPriorityHours: number;
  mediumPriorityHours: number;
  highPriorityHours: number;
  criticalPriorityHours: number;
}

export default function SLAConfigWidget() {
  const { data: session } = useSession();
  const [config, setConfig] = useState<SLAConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // @ts-ignore
  const brandId = session?.user?.brandId;

  useEffect(() => {
    if (brandId) fetchConfig();
  }, [brandId, session]);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/sla-config`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );
      setConfig(res.data);
    } catch (err) {
      console.error(err);
      // Don't toast error on fetch, might be 404 for new brands which is handled by controller returning defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/sla-config`,
        {
          low: config.lowPriorityHours,
          medium: config.mediumPriorityHours,
          high: config.highPriorityHours,
          critical: config.criticalPriorityHours,
        },
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );
      toast.success("SLA settings saved");
    } catch (err) {
      toast.error("Failed to save SLA settings");
    } finally {
      setSaving(false);
    }
  };

  const updateVal = (key: keyof SLAConfig, val: number) => {
    if (!config) return;
    setConfig({ ...config, [key]: val });
  };

  if (loading) return <StandardLoader />;
  if (!config) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Service Level Agreements (SLA)
        </CardTitle>
        <CardDescription>
          Set response time targets for different priority levels (in hours).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <SLASlider
          label="Low Priority"
          value={config.lowPriorityHours}
          onChange={(v) => updateVal("lowPriorityHours", v)}
          color="bg-slate-500"
        />
        <SLASlider
          label="Medium Priority"
          value={config.mediumPriorityHours}
          onChange={(v) => updateVal("mediumPriorityHours", v)}
          color="bg-blue-500"
        />
        <SLASlider
          label="High Priority"
          value={config.highPriorityHours}
          onChange={(v) => updateVal("highPriorityHours", v)}
          color="bg-orange-500"
        />
        <SLASlider
          label="Critical Priority"
          value={config.criticalPriorityHours}
          onChange={(v) => updateVal("criticalPriorityHours", v)}
          max={24}
          color="bg-red-500"
          warning={
            config.criticalPriorityHours > 4 ? "Recommended: < 4h" : undefined
          }
        />

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Update Policies"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SLASlider({
  label,
  value,
  onChange,
  max = 72,
  color,
  warning,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  color: string;
  warning?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          {label}
        </label>
        <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded border">
          {value} hours
        </span>
      </div>
      <Slider
        min={1}
        max={max}
        step={1}
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        className="w-full"
      />
      {warning && (
        <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold uppercase">
          <AlertTriangle className="w-3 h-3" />
          {warning}
        </div>
      )}
    </div>
  );
}
