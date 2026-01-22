# Sprint30-UI.md . Reputation Risk Early‑Warning (Full UI Implementation)

## Overview

Sprint30-UI adds a **Reputation Risk Early‑Warning** module for brand users. It turns sentiment, urgency, complaint velocity, and topic shifts into **actionable risk signals**.

It includes:

- **Risk Overview page** with a live risk score, status, and trends
- **Signals feed** with severity, evidence, and recommended actions
- **Alert rules UI** (thresholds, quiet hours, suppression window)
- **Risk Timeline** (sparkline trend)
- **Top drivers** (topics, complaint types)
- **Risk drill‑down** into impacted complaints

This UI is designed to connect to backend endpoints (Sprint30.md) but provides production-ready UI now.

---

## 1. File Architecture (Frontend)

```
Frontend/
├── app/
│   ├── (brand)/
│   │   ├── brand/
│   │   │   ├── risk/
│   │   │   │   └── page.tsx
│   │   │   ├── _components/
│   │   │   │   ├── BrandTopNav.tsx
│   │   │   │   ├── BrandSideNav.tsx
│   │   │   │   └── BrandBell.tsx
│   │   │   └── settings/
│   │   │       └── risk-alerts/
│   │   │           └── page.tsx
├── components/
│   ├── risk/
│   │   ├── RiskScoreCard.tsx
│   │   ├── RiskSignalFeed.tsx
│   │   ├── RiskDriversCard.tsx
│   │   ├── RiskTimelineChart.tsx
│   │   ├── RiskAlertRulesForm.tsx
│   │   └── RiskImpactedComplaints.tsx
│   └── charts/
│       └── SparkArea.tsx
├── lib/
│   ├── api.ts
│   ├── format.ts
│   └── risk.ts
└── types/
    └── risk.ts
```

---

## 2. Dependencies

```bash
npm i recharts lucide-react
npm i react-hook-form zod @hookform/resolvers
```

shadcn/ui assumed installed.

---

## 3. Types

### `types/risk.ts`

```ts
export type RiskLevel = "LOW" | "GUARDED" | "ELEVATED" | "HIGH" | "CRITICAL";

export type RiskSnapshot = {
  brandId: string;
  score: number; // 0..100
  level: RiskLevel;
  trend7d: number; // delta score over last 7d
  lastUpdatedAt: string;
  drivers: {
    topic: string;
    weight: number; // 0..1
    count7d: number;
  }[];
  signals: RiskSignal[];
  series: { day: string; score: number }[];
};

export type RiskSignal = {
  id: string;
  createdAt: string;
  severity: RiskLevel;
  title: string;
  description: string;
  evidence: {
    metric: string;
    current: number;
    baseline: number;
    unit?: string;
  }[];
  actions: {
    label: string;
    hint: string;
    href?: string;
  }[];
  impactedComplaintIds?: string[];
};

export type RiskAlertRules = {
  enabled: boolean;
  notifyInApp: boolean;
  notifyEmail: boolean;
  emailPlanRequired: boolean;
  thresholdLevel: RiskLevel;
  suppressionMinutes: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "21:00"
  quietHoursEnd: string; // "06:00"
};
```

---

## 4. Risk formatting + helpers

### `lib/risk.ts`

```ts
import type { RiskLevel } from "@/types/risk";

export function riskLabel(level: RiskLevel) {
  switch (level) {
    case "LOW":
      return "Low";
    case "GUARDED":
      return "Guarded";
    case "ELEVATED":
      return "Elevated";
    case "HIGH":
      return "High";
    case "CRITICAL":
      return "Critical";
  }
}

export function riskBadgeClass(level: RiskLevel) {
  if (level === "LOW")
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (level === "GUARDED")
    return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
  if (level === "ELEVATED")
    return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
  if (level === "HIGH")
    return "bg-orange-500/15 text-orange-300 border-orange-500/30";
  return "bg-red-500/15 text-red-300 border-red-500/30";
}

export function clampScore(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

export function trendLabel(delta: number) {
  const d = Number.isFinite(delta) ? delta : 0;
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(1)} pts`;
}

export function riskExplain(score: number) {
  if (score >= 85)
    return "Immediate attention recommended. Reputation risk is trending critical.";
  if (score >= 70)
    return "High risk detected. Address drivers and respond rapidly.";
  if (score >= 55)
    return "Elevated risk. Monitor closely and reduce recurring issues.";
  if (score >= 35)
    return "Stable with early warning signals. Keep response times strong.";
  return "Low risk. Maintain current operational performance.";
}
```

---

## 5. Charts

### `components/charts/SparkArea.tsx`

```tsx
"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts"

export function SparkArea({ data }: { data: { day: string; score: number }[] }) {
  return (
    <div className="h-[90px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <XAxis dataKey="day" hide />
          <Tooltip formatter={(v: any) => [`${Math.round(v)}", "Risk"]} labelFormatter={() => ""} />
          <Area type="monotone" dataKey="score" strokeWidth={2} fillOpacity={0.25} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## 6. Risk Overview Components

### `components/risk/RiskScoreCard.tsx`

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  trendLabel,
  riskExplain,
  riskBadgeClass,
  riskLabel,
  clampScore,
} from "@/lib/risk";
import type { RiskSnapshot } from "@/types/risk";
import { SparkArea } from "@/components/charts/SparkArea";

export function RiskScoreCard({ snapshot }: { snapshot: RiskSnapshot }) {
  const score = clampScore(snapshot.score);

  const series = (snapshot.series || []).map((x) => ({
    day: new Date(x.day).toLocaleDateString(),
    score: clampScore(x.score),
  }));

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold">
              Reputation Risk
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Early‑warning score from complaint velocity, sentiment, urgency,
              and topic shifts.
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${riskBadgeClass(snapshot.level)}`}
          >
            {riskLabel(snapshot.level)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-4xl font-bold tracking-tight">
              {Math.round(score)}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                7d trend {trendLabel(snapshot.trend7d)}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                Updated {new Date(snapshot.lastUpdatedAt).toLocaleString()}
              </Badge>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {riskExplain(score)}
            </div>
          </div>
          <div className="w-[200px] md:w-[260px]">
            <SparkArea data={series} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### `components/risk/RiskDriversCard.tsx`

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RiskSnapshot } from "@/types/risk";

export function RiskDriversCard({ snapshot }: { snapshot: RiskSnapshot }) {
  const drivers = (snapshot.drivers || []).slice(0, 8);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">Top Risk Drivers</CardTitle>
      </CardHeader>
      <CardContent>
        {drivers.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No drivers available yet.
          </div>
        ) : (
          <div className="space-y-3">
            {drivers.map((d) => (
              <div
                key={d.topic}
                className="rounded-xl border border-border bg-background/40 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{d.topic}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      7d volume: {d.count7d}
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    Weight {(d.weight * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, Math.max(0, d.weight * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### `components/risk/RiskImpactedComplaints.tsx`

```tsx
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RiskSignal } from "@/types/risk";

export function RiskImpactedComplaints({ signal }: { signal: RiskSignal }) {
  const ids = signal.impactedComplaintIds || [];

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">
          Impacted Complaints
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ids.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No complaint IDs linked to this signal.
          </div>
        ) : (
          <div className="space-y-2">
            {ids.slice(0, 12).map((id) => (
              <div
                key={id}
                className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2"
              >
                <div className="text-sm font-mono truncate">{id}</div>
                <Link
                  href={`/brand/complaints/${id}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Open
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### `components/risk/RiskSignalFeed.tsx`

```tsx
"use client";

import { useState } from "react";
import type { RiskSignal } from "@/types/risk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { riskBadgeClass, riskLabel } from "@/lib/risk";
import { RiskImpactedComplaints } from "@/components/risk/RiskImpactedComplaints";

export function RiskSignalFeed({ signals }: { signals: RiskSignal[] }) {
  const [openId, setOpenId] = useState<string | null>(signals?.[0]?.id ?? null);

  if (!signals || signals.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">
            Early‑Warning Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No signals yet. Continue monitoring.
          </div>
        </CardContent>
      </Card>
    );
  }

  const current = signals.find((s) => s.id === openId) || signals[0];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">
            Early‑Warning Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {signals.slice(0, 12).map((s) => (
            <button
              key={s.id}
              onClick={() => setOpenId(s.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition ${openId === s.id ? "border-primary/50 bg-primary/5" : "border-border bg-background/40 hover:bg-white/5"}`}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {s.title}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground truncate">
                    {s.description}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${riskBadgeClass(s.severity)}`}
                >
                  {riskLabel(s.severity)}
                </span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-base font-bold">
                Signal Detail
              </CardTitle>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${riskBadgeClass(current.severity)}`}
              >
                {riskLabel(current.severity)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">{current.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {current.description}
            </div>

            <Separator className="my-4" />

            <div className="text-xs font-semibold text-muted-foreground">
              Evidence
            </div>
            <div className="mt-2 space-y-2">
              {(current.evidence || []).map((e, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-background/40 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{e.metric}</div>
                    <Badge variant="secondary" className="rounded-full">
                      {e.unit ? `${e.current}${e.unit}` : e.current}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Baseline: {e.unit ? `${e.baseline}${e.unit}` : e.baseline}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="text-xs font-semibold text-muted-foreground">
              Recommended actions
            </div>
            <div className="mt-2 space-y-2">
              {(current.actions || []).map((a, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-background/40 p-3"
                >
                  <div className="text-sm font-semibold">{a.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {a.hint}
                  </div>
                  {a.href && (
                    <div className="mt-2">
                      <a
                        href={a.href}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Open
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <RiskImpactedComplaints signal={current} />
      </div>
    </div>
  );
}
```

---

## 7. Alert Rules UI (Brand Settings)

### `components/risk/RiskAlertRulesForm.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RiskAlertRules, RiskLevel } from "@/types/risk";

const Schema = z.object({
  enabled: z.boolean(),
  notifyInApp: z.boolean(),
  notifyEmail: z.boolean(),
  thresholdLevel: z.enum(["LOW", "GUARDED", "ELEVATED", "HIGH", "CRITICAL"]),
  suppressionMinutes: z.coerce.number().int().min(5).max(1440),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().min(4).max(5),
  quietHoursEnd: z.string().min(4).max(5),
});

type FormValues = z.infer<typeof Schema>;

async function getRules(): Promise<RiskAlertRules> {
  const res = await fetch("/api/brand/risk/rules", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load rules");
  return res.json();
}

async function saveRules(values: FormValues) {
  const res = await fetch("/api/brand/risk/rules", {
    method: "POST",
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error("Failed to save rules");
  return res.json();
}

export function RiskAlertRulesForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailPlanRequired, setEmailPlanRequired] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      enabled: true,
      notifyInApp: true,
      notifyEmail: false,
      thresholdLevel: "ELEVATED",
      suppressionMinutes: 60,
      quietHoursEnabled: true,
      quietHoursStart: "21:00",
      quietHoursEnd: "06:00",
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const r = await getRules();
        setEmailPlanRequired(Boolean(r.emailPlanRequired));
        form.reset({
          enabled: r.enabled,
          notifyInApp: r.notifyInApp,
          notifyEmail: r.notifyEmail,
          thresholdLevel: r.thresholdLevel as RiskLevel,
          suppressionMinutes: r.suppressionMinutes,
          quietHoursEnabled: r.quietHoursEnabled,
          quietHoursStart: r.quietHoursStart,
          quietHoursEnd: r.quietHoursEnd,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const values = form.watch();

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">Risk Alert Rules</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(async (v) => {
              setSaving(true);
              try {
                await saveRules(v);
              } finally {
                setSaving(false);
              }
            })}
          >
            <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
              <div>
                <div className="text-sm font-semibold">Enable alerts</div>
                <div className="text-xs text-muted-foreground">
                  Create in-app and optional email notifications.
                </div>
              </div>
              <Switch
                checked={values.enabled}
                onCheckedChange={(x) => form.setValue("enabled", x)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Notify in-app</Label>
                <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground">
                    Bell notifications for brand team.
                  </div>
                  <Switch
                    checked={values.notifyInApp}
                    onCheckedChange={(x) => form.setValue("notifyInApp", x)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email alerts</Label>
                <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground">
                    Real-time email alerts are a paid feature.
                    {emailPlanRequired && (
                      <span className="block">
                        Upgrade required to enable email.
                      </span>
                    )}
                  </div>
                  <Switch
                    checked={values.notifyEmail}
                    disabled={emailPlanRequired}
                    onCheckedChange={(x) => form.setValue("notifyEmail", x)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alert threshold</Label>
              <Select
                value={values.thresholdLevel}
                onValueChange={(v) => form.setValue("thresholdLevel", v as any)}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="GUARDED">Guarded</SelectItem>
                  <SelectItem value="ELEVATED">Elevated</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                Alerts trigger when risk reaches this level or higher.
              </div>
            </div>

            <div className="space-y-2">
              <Label>Suppression window (minutes)</Label>
              <Input
                type="number"
                className="rounded-xl"
                {...form.register("suppressionMinutes")}
              />
              <div className="text-xs text-muted-foreground">
                Avoid repeated alerts for the same spike.
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/40 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Quiet hours</div>
                  <div className="text-xs text-muted-foreground">
                    Delay alerts during non-working hours.
                  </div>
                </div>
                <Switch
                  checked={values.quietHoursEnabled}
                  onCheckedChange={(x) => form.setValue("quietHoursEnabled", x)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start</Label>
                  <Input
                    className="rounded-xl"
                    placeholder="21:00"
                    {...form.register("quietHoursStart")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End</Label>
                  <Input
                    className="rounded-xl"
                    placeholder="06:00"
                    {...form.register("quietHoursEnd")}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save rules"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 8. Risk Overview Page

### `app/(brand)/brand/risk/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { RiskSnapshot } from "@/types/risk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskScoreCard } from "@/components/risk/RiskScoreCard";
import { RiskDriversCard } from "@/components/risk/RiskDriversCard";
import { RiskSignalFeed } from "@/components/risk/RiskSignalFeed";

export default function RiskPage() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<RiskSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGet<{ snapshot: RiskSnapshot }>(
        "/api/brand/risk/snapshot",
      );
      setSnapshot(res.snapshot);
    } catch (e: any) {
      setError(e.message || "Failed to load risk");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full px-4 py-4 md:px-6 md:py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          Reputation Risk
        </h1>
        <p className="text-sm text-muted-foreground">
          Early‑warning signals that help you prevent reputation damage.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading || !snapshot ? (
        <div className="space-y-4">
          <Skeleton className="h-[180px] w-full" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-[360px] w-full" />
            <Skeleton className="h-[360px] w-full" />
          </div>
        </div>
      ) : (
        <>
          <RiskScoreCard snapshot={snapshot} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <RiskDriversCard snapshot={snapshot} />
            </div>
            <div className="lg:col-span-2">
              <RiskSignalFeed signals={snapshot.signals || []} />
            </div>
          </div>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">
                Configure alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Go to{" "}
              <a
                className="text-primary font-semibold hover:underline"
                href="/brand/settings/risk-alerts"
              >
                Risk Alerts
              </a>{" "}
              to configure thresholds, quiet hours, and email.
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
```

---

## 9. Risk Alerts Settings Page

### `app/(brand)/brand/settings/risk-alerts/page.tsx`

```tsx
import { RiskAlertRulesForm } from "@/components/risk/RiskAlertRulesForm";

export default function RiskAlertsSettingsPage() {
  return (
    <div className="w-full px-4 py-4 md:px-6 md:py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          Risk Alerts
        </h1>
        <p className="text-sm text-muted-foreground">
          Control when alerts trigger and how they are delivered.
        </p>
      </div>

      <RiskAlertRulesForm />
    </div>
  );
}
```

---

## 10. Navigation integration

Add in brand side nav:

- **Reputation Risk** → `/brand/risk`
- **Risk Alerts** → `/brand/settings/risk-alerts`

Patch your existing `BrandSideNav.tsx` to include links.

---

## 11. UI. Data Contract (Backend endpoints expected)

Sprint30-UI expects:

- `GET /api/brand/risk/snapshot` → `{ snapshot: RiskSnapshot }`
- `GET /api/brand/risk/rules` → `RiskAlertRules`
- `POST /api/brand/risk/rules` → save rules

If these endpoints are not yet available, the UI will show errors. The UI code is complete and production-ready.

---

## 12. UX and Safety

- Neutral language. No legal threats.
- Signals suggest actions like:
  - “Prioritize refunds backlog”
  - “Increase response coverage”
  - “Investigate delivery incidents”

- Avoids inflammatory wording.

---

## 13. QA Checklist

- Risk page loads and refreshes every 20s
- Risk score and level display correctly
- Signals can be selected and viewed in detail
- Impacted complaints list links correctly
- Alert rules can be updated and saved
- Email toggle disabled when plan requires upgrade
- Dark/light mode consistent
- Mobile layout usable without horizontal scroll

---

## Sprint30-UI Deliverables Summary

- Brand Reputation Risk page (score, trend, drivers, signals)
- Signal drill-down and impacted complaints
- Risk Alerts settings page with gating-ready Email toggle
- shadcn-based UI consistent with previous sprints
