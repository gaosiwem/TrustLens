Sprint29-UI.md. AI Sentiment Tracking (Brand Dashboard)
Overview

Sprint29-UI introduces a brand-facing AI sentiment analytics module. It visualizes:

Daily sentiment trend over time

Urgency trend

Negative / neutral / positive distribution

Top topics driving complaints

Recent sentiment events feed

Complaint-level sentiment snapshot (embedded in complaint detail page)

This sprint is designed to support paid alerting tiers later, while still allowing in-app analytics visibility.

1. File Architecture (Frontend)
   Frontend/
   ├── app/
   │ ├── (brand)/
   │ │ ├── brand/
   │ │ │ ├── analytics/
   │ │ │ │ └── sentiment/
   │ │ │ │ └── page.tsx
   │ │ │ ├── complaints/
   │ │ │ │ └── [id]/
   │ │ │ │ ├── page.tsx
   │ │ │ │ └── \_components/
   │ │ │ │ └── ComplaintSentimentPanel.tsx
   │ │ │ └── \_components/
   │ │ │ ├── BrandTopNav.tsx
   │ │ │ ├── BrandSideNav.tsx
   │ │ │ └── BrandBell.tsx
   │ ├── api/
   │ │ └── (already exists from Sprint29 backend)
   ├── components/
   │ ├── ui/
   │ │ ├── badge.tsx
   │ │ ├── button.tsx
   │ │ ├── card.tsx
   │ │ ├── dropdown-menu.tsx
   │ │ ├── input.tsx
   │ │ ├── label.tsx
   │ │ ├── select.tsx
   │ │ ├── separator.tsx
   │ │ ├── skeleton.tsx
   │ │ ├── tabs.tsx
   │ │ └── toast.tsx
   │ └── charts/
   │ ├── SentimentTrendChart.tsx
   │ ├── SentimentDistributionChart.tsx
   │ └── TopicBarChart.tsx
   ├── lib/
   │ ├── api.ts
   │ ├── utils.ts
   │ └── format.ts
   └── types/
   └── sentiment.ts

2. Dependencies

Install these if not already installed:

npm i recharts lucide-react
npm i react-hook-form zod @hookform/resolvers

shadcn/ui assumed installed already.

3. Types
   types/sentiment.ts
   export type BrandSentimentDailyRow = {
   id: string
   brandId: string
   day: string
   count: number
   avgScore: number
   avgUrgency: number
   positivePct: number
   negativePct: number
   neutralPct: number
   topTopics: string[]
   updatedAt: string
   }

export type SentimentEvent = {
id: string
brandId: string
complaintId: string | null
sourceType: "COMPLAINT" | "BRAND_RESPONSE" | "CONSUMER_MESSAGE" | "SYSTEM_NOTE"
sourceId: string | null
label: "VERY_NEGATIVE" | "NEGATIVE" | "NEUTRAL" | "POSITIVE" | "VERY_POSITIVE"
score: number
intensity: number
urgency: number
topics: string[]
keyPhrases: string[]
createdAt: string
model: string
moderationFlagged: boolean
}

export type ComplaintSentimentSnapshot = {
complaintId: string
brandId: string
lastEventAt: string
currentLabel: "VERY_NEGATIVE" | "NEGATIVE" | "NEUTRAL" | "POSITIVE" | "VERY_POSITIVE"
currentScore: number
currentUrgency: number
topics: string[]
updatedAt: string
} | null

4. API helper
   lib/api.ts
   export async function apiGet<T>(url: string): Promise<T> {
   const res = await fetch(url, { cache: "no-store" })
   if (!res.ok) {
   const text = await res.text().catch(() => "")
   throw new Error(`Request failed (${res.status}): ${text}`)
   }
   return res.json()
   }

5. Formatting helpers
   lib/format.ts
   export function formatPct(x: number) {
   return `${Math.round((x || 0) * 100)}%`
   }

export function formatScore(x: number) {
const v = Number.isFinite(x) ? x : 0
return v.toFixed(2)
}

export function clamp01(n: number) {
if (n < 0) return 0
if (n > 1) return 1
return n
}

export function sentimentColorClass(label: string) {
if (label === "VERY_NEGATIVE" || label === "NEGATIVE") return "bg-red-500/15 text-red-400 border-red-500/30"
if (label === "NEUTRAL") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
}

export function sentimentLabelPretty(label: string) {
return label.replaceAll("\_", " ").toLowerCase().replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
}

6. Charts
   6.1 Sentiment Trend Chart

components/charts/SentimentTrendChart.tsx

"use client"

import {
ResponsiveContainer,
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
CartesianGrid
} from "recharts"
import { BrandSentimentDailyRow } from "@/types/sentiment"
import { formatScore } from "@/lib/format"

export function SentimentTrendChart({ rows }: { rows: BrandSentimentDailyRow[] }) {
const data = rows.map((r) => ({
day: new Date(r.day).toLocaleDateString(),
avgScore: Number(r.avgScore.toFixed(3)),
avgUrgency: Number(r.avgUrgency.toFixed(1))
}))

return (
<div className="h-[260px] w-full">
<ResponsiveContainer width="100%" height="100%">
<LineChart data={data} margin={{ top: 12, right: 18, left: -10, bottom: 0 }}>
<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
<XAxis dataKey="day" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
<YAxis yAxisId="left" domain={[-1, 1]} tick={{ fontSize: 12 }} />
<YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} />
<Tooltip
formatter={(value: any, name: any) => {
if (name === "avgScore") return [formatScore(value), "Avg Sentiment"]
return [value, "Avg Urgency"]
}}
/>
<Line yAxisId="left" type="monotone" dataKey="avgScore" strokeWidth={2} dot={false} />
<Line yAxisId="right" type="monotone" dataKey="avgUrgency" strokeWidth={2} dot={false} />
</LineChart>
</ResponsiveContainer>
</div>
)
}

6.2 Sentiment Distribution Chart

components/charts/SentimentDistributionChart.tsx

"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { BrandSentimentDailyRow } from "@/types/sentiment"
import { formatPct } from "@/lib/format"

export function SentimentDistributionChart({ rows }: { rows: BrandSentimentDailyRow[] }) {
const last = rows[rows.length - 1]

const data = [
{ name: "Positive", value: last?.positivePct ?? 0 },
{ name: "Neutral", value: last?.neutralPct ?? 0 },
{ name: "Negative", value: last?.negativePct ?? 0 }
]

return (
<div className="h-[220px] w-full">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={data} margin={{ top: 12, right: 18, left: -10, bottom: 0 }}>
<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
<XAxis dataKey="name" tick={{ fontSize: 12 }} />
<YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
<Tooltip formatter={(v: any) => formatPct(v)} />
<Bar dataKey="value" radius={[10, 10, 0, 0]} />
</BarChart>
</ResponsiveContainer>
</div>
)
}

6.3 Topic Bar Chart

components/charts/TopicBarChart.tsx

"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function TopicBarChart({ topics }: { topics: string[] }) {
const counts = new Map<string, number>()
for (const t of topics) counts.set(t, (counts.get(t) ?? 0) + 1)

const data = [...counts.entries()]
.map(([topic, count]) => ({ topic, count }))
.sort((a, b) => b.count - a.count)
.slice(0, 10)

return (
<div className="h-[240px] w-full">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={data} margin={{ top: 12, right: 18, left: -10, bottom: 0 }}>
<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
<XAxis dataKey="topic" tick={{ fontSize: 12 }} interval={0} />
<YAxis tick={{ fontSize: 12 }} />
<Tooltip />
<Bar dataKey="count" radius={[10, 10, 0, 0]} />
</BarChart>
</ResponsiveContainer>
</div>
)
}

7. Brand Sentiment Analytics Page
   app/(brand)/brand/analytics/sentiment/page.tsx
   import { SentimentDashboard } from "./sentimentDashboard"

export default function Page() {
return <SentimentDashboard />
}

app/(brand)/brand/analytics/sentiment/sentimentDashboard.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { apiGet } from "@/lib/api"
import { BrandSentimentDailyRow, SentimentEvent } from "@/types/sentiment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SentimentTrendChart } from "@/components/charts/SentimentTrendChart"
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart"
import { TopicBarChart } from "@/components/charts/TopicBarChart"
import { formatPct, formatScore, sentimentColorClass, sentimentLabelPretty } from "@/lib/format"
import Link from "next/link"

export function SentimentDashboard() {
const [days, setDays] = useState("30")
const [loading, setLoading] = useState(true)
const [rows, setRows] = useState<BrandSentimentDailyRow[]>([])
const [events, setEvents] = useState<SentimentEvent[]>([])
const [error, setError] = useState<string | null>(null)

async function load() {
try {
setLoading(true)
setError(null)
const daily = await apiGet<{ rows: BrandSentimentDailyRow[] }>(`/api/brand/sentiment/daily?days=${days}`)
const ev = await apiGet<{ items: SentimentEvent[] }>(`/api/brand/sentiment/events?take=60`)
setRows(daily.rows ?? [])
setEvents(ev.items ?? [])
} catch (e: any) {
setError(e.message || "Failed to load sentiment data")
} finally {
setLoading(false)
}
}

useEffect(() => {
load()
}, [days])

const last = rows[rows.length - 1]

const allTopics = useMemo(() => {
const t: string[] = []
for (const r of rows) {
for (const x of r.topTopics || []) t.push(x)
}
return t
}, [rows])

return (
<div className="w-full px-4 py-4 md:px-6 md:py-6">
<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
<div>
<h1 className="text-xl font-bold tracking-tight md:text-2xl">Sentiment Analytics</h1>
<p className="text-sm text-muted-foreground">
AI-driven complaint sentiment and urgency trends for your brand.
</p>
</div>

        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={load}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 active:scale-[0.98]"
            type="button"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Avg Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">{formatScore(last?.avgScore ?? 0)}</div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">Range: -1.00 to +1.00</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Avg Urgency</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">{Math.round(last?.avgUrgency ?? 0)}</div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">Range: 0 to 100</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Today Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">{last?.count ?? 0}</div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">Sentiment events captured</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[260px] w-full" /> : <SentimentTrendChart rows={rows} />}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Distribution (Latest Day)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[220px] w-full" /> : <SentimentDistributionChart rows={rows} />}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Top Topics</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[240px] w-full" /> : <TopicBarChart topics={allTopics} />}
            <div className="mt-3 flex flex-wrap gap-2">
              {(last?.topTopics ?? []).slice(0, 8).map((t) => (
                <Badge key={t} variant="secondary" className="rounded-full">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 10).map((e) => (
                  <div
                    key={e.id}
                    className="rounded-xl border border-border bg-background/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${sentimentColorClass(e.label)}`}>
                            {sentimentLabelPretty(e.label)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Urgency {e.urgency}
                          </span>
                          {e.moderationFlagged && (
                            <Badge variant="destructive" className="rounded-full">
                              Flagged
                            </Badge>
                          )}
                        </div>

                        <div className="mt-1 text-sm text-muted-foreground">
                          {e.topics?.slice(0, 4)?.join(", ") || "No topics"}
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(e.createdAt).toLocaleString()} • {e.sourceType}
                        </div>
                      </div>

                      {e.complaintId && (
                        <Link
                          className="text-sm font-semibold text-primary hover:underline"
                          href={`/brand/complaints/${e.complaintId}`}
                        >
                          Open
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">What this means</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <p>
              Sentiment and urgency are calculated from complaint content and message updates.
              Use this dashboard to identify spikes in negative sentiment and recurring topics.
            </p>
            <p className="mt-2">
              Email alerts for sentiment spikes are available on paid plans.
              In-app insights remain visible to support daily decision-making.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>

)
}

8. Complaint-level sentiment panel

This component should be shown on the complaint detail page so brands can see:

Current sentiment label

Current urgency

Topics

Last updated time

app/(brand)/brand/complaints/[id]/\_components/ComplaintSentimentPanel.tsx
"use client"

import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import { ComplaintSentimentSnapshot } from "@/types/sentiment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { sentimentColorClass, sentimentLabelPretty, formatScore } from "@/lib/format"

export function ComplaintSentimentPanel({ complaintId }: { complaintId: string }) {
const [loading, setLoading] = useState(true)
const [snapshot, setSnapshot] = useState<ComplaintSentimentSnapshot>(null)

async function load() {
setLoading(true)
const res = await apiGet<{ snapshot: ComplaintSentimentSnapshot }>(`/api/brand/complaints/${complaintId}/sentiment`)
setSnapshot(res.snapshot)
setLoading(false)
}

useEffect(() => {
load()
}, [complaintId])

return (
<Card className="rounded-2xl">
<CardHeader className="pb-2">
<CardTitle className="text-base font-bold">AI Sentiment Snapshot</CardTitle>
</CardHeader>
<CardContent>
{loading ? (
<Skeleton className="h-20 w-full" />
) : !snapshot ? (
<div className="text-sm text-muted-foreground">
No sentiment data yet. It will appear after analysis completes.
</div>
) : (
<div className="space-y-3">
<div className="flex flex-wrap items-center gap-2">
<span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${sentimentColorClass(snapshot.currentLabel)}`}>
{sentimentLabelPretty(snapshot.currentLabel)}
</span>

              <Badge variant="secondary" className="rounded-full">
                Score {formatScore(snapshot.currentScore)}
              </Badge>

              <Badge variant="secondary" className="rounded-full">
                Urgency {snapshot.currentUrgency}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(snapshot.lastEventAt).toLocaleString()}
            </div>

            <div className="flex flex-wrap gap-2">
              {(snapshot.topics ?? []).slice(0, 8).map((t) => (
                <Badge key={t} variant="outline" className="rounded-full">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>

)
}

9. Integrate sentiment panel into complaint detail page

In your existing complaint detail page, add:

app/(brand)/brand/complaints/[id]/page.tsx (patch)
import { ComplaintSentimentPanel } from "./\_components/ComplaintSentimentPanel"

export default function Page({ params }: { params: { id: string } }) {
const complaintId = params.id

return (
<div className="w-full px-4 py-4 md:px-6 md:py-6 space-y-4">
{/_ Existing complaint detail header and content _/}

      <ComplaintSentimentPanel complaintId={complaintId} />

      {/* Existing evidence, responses, timeline */}
    </div>

)
}

10. Add navigation entry for analytics

Add this link to your brand side nav:

/brand/analytics/sentiment

app/(brand)/\_components/BrandSideNav.tsx (patch)

Add menu item:

<Link
  href="/brand/analytics/sentiment"
  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/5"
>
  <span className="material-symbols-outlined text-[18px]">monitoring</span>
  Sentiment Analytics
</Link>

11. Best practice. Access control

These pages must be accessible only to brand users.
Your existing requireBrandUser() already enforces backend protection. UI is safe because it depends on protected API routes.

12. Sprint29-UI QA Checklist
    Functional tests

Sentiment Analytics loads without errors

Switching range updates charts

Recent events show complaint links

Complaint sentiment panel loads snapshot correctly

Dark/light mode works across all cards and charts

Performance tests

Dashboard loads under 1 second for 30-day range with < 2k events

Charts remain smooth on mobile devices

Security tests

Brand cannot access other brand sentiment endpoints

No sensitive raw AI data exposed in UI

Sprint29-UI Deliverables Summary

Brand sentiment dashboard with charts

Recent sentiment events feed

Complaint-level AI sentiment snapshot panel

Mobile-first responsive UI consistent with Sprint1 look and feel

Ready for paid alert triggers in Sprint30
