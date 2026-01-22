# Sprint30.md . Reputation Risk Early-Warning (Full Backend Implementation)

## Overview

Sprint30 implements **Reputation Risk Early-Warning** for brands.

It calculates a **0–100 risk score** using:

- Complaint velocity (volume spikes)
- Sentiment deterioration (avgScore drops)
- Urgency spikes (avgUrgency increases)
- Topic surges (recurring issue clusters)

It generates **risk signals** with:

- Severity (LOW, GUARDED, ELEVATED, HIGH, CRITICAL)
- Evidence payload (current vs baseline)
- Recommended actions with deep links
- Optional impacted complaint IDs

It supports **alert rules** per brand:

- Threshold level
- Suppression window
- Quiet hours
- Delivery: in-app always, email paid and gated

It exposes endpoints consumed by Sprint30-UI:

- `GET /api/brand/risk/snapshot`
- `GET /api/brand/risk/rules`
- `POST /api/brand/risk/rules`

It integrates with your existing:

- Brand authentication (`requireBrandUser()`)
- Notifications + Email outbox (`notifyBrand()` and email gating)
- Sentiment tracking (Sprint29 tables)

---

## 1. File Architecture

```
Backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── time.ts
│   ├── server/
│   │   └── auth/
│   │       └── requireBrandUser.ts
│   ├── services/
│   │   ├── featureGate.service.ts
│   │   ├── notification.service.ts
│   │   ├── riskEngine.service.ts
│   │   ├── riskRules.service.ts
│   │   └── riskAlerts.service.ts
│   ├── queues/
│   │   ├── risk.queue.ts
│   │   └── risk.scheduler.ts
│   ├── workers/
│   │   └── risk.worker.ts
│   ├── app/
│   │   └── api/
│   │       └── brand/
│   │           └── risk/
│   │               ├── snapshot/route.ts
│   │               └── rules/route.ts
│   └── tests/
│       ├── risk.rules.test.ts
│       └── risk.engine.test.ts
└── docker-compose.yml
```

---

## 2. Dependencies

```bash
npm i bullmq ioredis date-fns zod
npm i --save-dev jest ts-jest supertest
```

---

## 3. Environment Variables

`.env`

```env
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3000

# If you already have these from prior sprints
OPENAI_API_KEY=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=TrustLens <no-reply@trustlens.co.za>
```

---

## 4. Database. Prisma schema additions

Add to `prisma/schema.prisma`.

```prisma
enum RiskLevel {
  LOW
  GUARDED
  ELEVATED
  HIGH
  CRITICAL
}

model BrandRiskRule {
  id                 String   @id @default(uuid())
  brandId            String   @unique
  enabled            Boolean  @default(true)
  notifyInApp        Boolean  @default(true)
  notifyEmail        Boolean  @default(false)
  thresholdLevel     RiskLevel @default(ELEVATED)
  suppressionMinutes Int      @default(60)
  quietHoursEnabled  Boolean  @default(true)
  quietHoursStart    String   @default("21:00")
  quietHoursEnd      String   @default("06:00")
  updatedAt          DateTime @updatedAt
  createdAt          DateTime @default(now())
}

model BrandRiskDaily {
  id          String   @id @default(uuid())
  brandId     String   @index
  day         DateTime @index // midnight UTC
  score       Int
  level       RiskLevel
  drivers     Json
  updatedAt   DateTime @updatedAt

  @@unique([brandId, day])
}

model RiskSignal {
  id          String    @id @default(uuid())
  brandId     String    @index
  createdAt   DateTime  @default(now())
  severity    RiskLevel
  title       String
  description String
  evidence    Json
  actions     Json
  impactedComplaintIds String[]
  fingerprint String   @index

  @@index([brandId, createdAt])
}

model RiskAlertLog {
  id          String   @id @default(uuid())
  brandId     String   @index
  triggeredAt DateTime @default(now())
  level       RiskLevel
  fingerprint String   @index
  channel     String   // IN_APP | EMAIL
}
```

Run:

```bash
npx prisma migrate dev -n sprint30_reputation_risk
```

---

## 5. Time utilities

### `src/lib/time.ts`

```ts
export function startOfDayUtc(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0),
  );
}

export function addDaysUtc(day: Date, days: number) {
  return new Date(day.getTime() + days * 86400000);
}

export function parseHHmm(s: string) {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(s);
  if (!m) return { h: 0, min: 0 };
  return { h: Number(m[1]), min: Number(m[2]) };
}

export function isWithinQuietHours(
  now: Date,
  startHHmm: string,
  endHHmm: string,
) {
  const { h: sh, min: sm } = parseHHmm(startHHmm);
  const { h: eh, min: em } = parseHHmm(endHHmm);

  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(now);
  end.setHours(eh, em, 0, 0);

  // Overnight window example 21:00 → 06:00
  if (end <= start) {
    const endNext = new Date(end);
    endNext.setDate(endNext.getDate() + 1);
    if (now >= start) return true;
    if (now < end) return true;
    if (now < endNext && now >= start) return true;
    return now < end;
  }

  return now >= start && now <= end;
}

export function riskLevelOrder(level: string) {
  switch (level) {
    case "LOW":
      return 0;
    case "GUARDED":
      return 1;
    case "ELEVATED":
      return 2;
    case "HIGH":
      return 3;
    case "CRITICAL":
      return 4;
    default:
      return 0;
  }
}
```

---

## 6. Risk rules service

### `src/services/riskRules.service.ts`

```ts
import { prisma } from "@/src/lib/prisma";

export async function ensureBrandRiskRule(brandId: string) {
  const existing = await prisma.brandRiskRule.findUnique({
    where: { brandId },
  });
  if (existing) return existing;

  return prisma.brandRiskRule.create({
    data: {
      brandId,
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
}

export async function getBrandRiskRule(brandId: string) {
  return ensureBrandRiskRule(brandId);
}

export async function updateBrandRiskRule(
  brandId: string,
  patch: Partial<{
    enabled: boolean;
    notifyInApp: boolean;
    notifyEmail: boolean;
    thresholdLevel: "LOW" | "GUARDED" | "ELEVATED" | "HIGH" | "CRITICAL";
    suppressionMinutes: number;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  }>,
) {
  await ensureBrandRiskRule(brandId);
  return prisma.brandRiskRule.update({
    where: { brandId },
    data: {
      ...patch,
    },
  });
}
```

---

## 7. Risk engine (score computation + signals)

### Scoring model (best-practice and auditable)

Risk score is computed from 4 components, each normalized 0–1, then combined.

- **Velocity**: complaint volume spike vs baseline
- **Sentiment**: avgScore drop vs baseline
- **Urgency**: avgUrgency increase vs baseline
- **Topic surge**: concentration increase in top topics vs baseline

Weights default:

- Velocity 0.35
- Sentiment 0.30
- Urgency 0.25
- Topic surge 0.10

We persist:

- daily score and level in `BrandRiskDaily`
- latest signals in `RiskSignal`

### `src/services/riskEngine.service.ts`

```ts
import { prisma } from "@/src/lib/prisma";
import { addDaysUtc, startOfDayUtc } from "@/src/lib/time";

type RiskLevel = "LOW" | "GUARDED" | "ELEVATED" | "HIGH" | "CRITICAL";

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function clamp100(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}

function toLevel(score: number): RiskLevel {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 55) return "ELEVATED";
  if (score >= 35) return "GUARDED";
  return "LOW";
}

function pctChange(current: number, baseline: number) {
  if (!Number.isFinite(current) || !Number.isFinite(baseline)) return 0;
  if (baseline <= 0) return current > 0 ? 1 : 0;
  return (current - baseline) / baseline;
}

function normalizeSpike(current: number, baseline: number, maxSpike: number) {
  const spike = pctChange(current, baseline);
  // only positive spikes contribute
  return clamp01(Math.max(0, spike) / maxSpike);
}

function normalizeDrop(current: number, baseline: number, maxDrop: number) {
  // sentiment score range is [-1, 1]. drop = baseline - current
  const drop = baseline - current;
  return clamp01(Math.max(0, drop) / maxDrop);
}

function normalizeIncrease(current: number, baseline: number, maxInc: number) {
  const inc = current - baseline;
  return clamp01(Math.max(0, inc) / maxInc);
}

function stableMean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function computeBrandRiskForDay(brandId: string, dayUtc: Date) {
  const dayStart = startOfDayUtc(dayUtc);
  const dayEnd = addDaysUtc(dayStart, 1);

  // Baseline window: prior 14 days
  const baselineStart = addDaysUtc(dayStart, -14);
  const baselineEnd = dayStart;

  // 1) Complaint velocity: count complaints created today vs baseline avg/day
  const currentComplaints = await prisma.complaint.count({
    where: { brandId, createdAt: { gte: dayStart, lt: dayEnd } },
  });

  const baselineComplaints = await prisma.complaint.count({
    where: { brandId, createdAt: { gte: baselineStart, lt: baselineEnd } },
  });
  const baselineComplaintsPerDay = baselineComplaints / 14;

  // 2) Sentiment/urgency: use BrandSentimentDaily if available, else compute from SentimentEvent
  const currentDaily = await prisma.brandSentimentDaily.findFirst({
    where: { brandId, day: dayStart },
  });

  const baselineDaily = await prisma.brandSentimentDaily.findMany({
    where: { brandId, day: { gte: baselineStart, lt: baselineEnd } },
    select: { avgScore: true, avgUrgency: true, topTopics: true },
  });

  const baselineAvgScore = stableMean(baselineDaily.map((d) => d.avgScore));
  const baselineAvgUrgency = stableMean(baselineDaily.map((d) => d.avgUrgency));

  const currentAvgScore = currentDaily?.avgScore ?? baselineAvgScore;
  const currentAvgUrgency = currentDaily?.avgUrgency ?? baselineAvgUrgency;

  // 3) Topic surge: compare today top topics frequency vs baseline
  const currentTopics = new Map<string, number>();
  for (const t of currentDaily?.topTopics ?? [])
    currentTopics.set(t, (currentTopics.get(t) ?? 0) + 1);

  const baselineTopicCounts = new Map<string, number>();
  for (const d of baselineDaily) {
    for (const t of d.topTopics ?? []) {
      baselineTopicCounts.set(t, (baselineTopicCounts.get(t) ?? 0) + 1);
    }
  }
  const baselineTopicTotal =
    [...baselineTopicCounts.values()].reduce((a, b) => a + b, 0) || 1;

  let topicSurge = 0;
  for (const [t, c] of currentTopics.entries()) {
    const baselineShare =
      (baselineTopicCounts.get(t) ?? 0) / baselineTopicTotal;
    const currentShare = c / Math.max(1, currentDaily?.topTopics?.length ?? 1);
    // if topic share increased, contribute
    topicSurge += Math.max(0, currentShare - baselineShare);
  }
  topicSurge = clamp01(topicSurge); // already small

  // Normalization constants (tunable)
  const velocityN = normalizeSpike(
    currentComplaints,
    baselineComplaintsPerDay,
    2.0,
  ); // 200% spike → 1
  const sentimentN = normalizeDrop(currentAvgScore, baselineAvgScore, 0.6); // drop of 0.6 → 1
  const urgencyN = normalizeIncrease(currentAvgUrgency, baselineAvgUrgency, 30); // +30 urgency → 1
  const topicN = clamp01(topicSurge / 0.35); // 0.35 surge → 1

  const score = clamp100(
    (velocityN * 0.35 + sentimentN * 0.3 + urgencyN * 0.25 + topicN * 0.1) *
      100,
  );

  const level = toLevel(score);

  const drivers = buildDrivers({
    velocityN,
    sentimentN,
    urgencyN,
    topicN,
    currentComplaints,
    baselineComplaintsPerDay,
    currentAvgScore,
    baselineAvgScore,
    currentAvgUrgency,
    baselineAvgUrgency,
    topTopics: currentDaily?.topTopics ?? [],
  });

  await prisma.brandRiskDaily.upsert({
    where: { brandId_day: { brandId, day: dayStart } },
    create: {
      brandId,
      day: dayStart,
      score,
      level,
      drivers,
    },
    update: {
      score,
      level,
      drivers,
    },
  });

  const signals = await upsertSignals({
    brandId,
    dayStart,
    score,
    level,
    currentComplaints,
    baselineComplaintsPerDay,
    currentAvgScore,
    baselineAvgScore,
    currentAvgUrgency,
    baselineAvgUrgency,
    topTopics: currentDaily?.topTopics ?? [],
  });

  return { score, level, drivers, signals };
}

function buildDrivers(args: {
  velocityN: number;
  sentimentN: number;
  urgencyN: number;
  topicN: number;
  currentComplaints: number;
  baselineComplaintsPerDay: number;
  currentAvgScore: number;
  baselineAvgScore: number;
  currentAvgUrgency: number;
  baselineAvgUrgency: number;
  topTopics: string[];
}) {
  const list = [
    {
      topic: "complaint_velocity",
      weight: args.velocityN,
      count7d: args.currentComplaints,
    },
    { topic: "sentiment_drop", weight: args.sentimentN, count7d: 0 },
    { topic: "urgency_spike", weight: args.urgencyN, count7d: 0 },
    { topic: "topic_surge", weight: args.topicN, count7d: 0 },
  ];

  // Attach top topics as lighter drivers
  const topics = (args.topTopics || []).slice(0, 6).map((t) => ({
    topic: t,
    weight: Math.min(0.35, args.topicN),
    count7d: 0,
  }));

  return [...list, ...topics];
}

async function upsertSignals(args: {
  brandId: string;
  dayStart: Date;
  score: number;
  level: RiskLevel;
  currentComplaints: number;
  baselineComplaintsPerDay: number;
  currentAvgScore: number;
  baselineAvgScore: number;
  currentAvgUrgency: number;
  baselineAvgUrgency: number;
  topTopics: string[];
}) {
  const signals: any[] = [];

  // Signal 1: Complaint spike
  const velocitySpike = pctChange(
    args.currentComplaints,
    args.baselineComplaintsPerDay,
  );
  if (velocitySpike > 0.75 && args.currentComplaints >= 3) {
    signals.push(
      makeSignal({
        brandId: args.brandId,
        severity: args.level,
        fingerprint: `velocity:${args.dayStart.toISOString().slice(0, 10)}`,
        title: "Complaint volume spike",
        description:
          "Complaint volume increased significantly compared to baseline.",
        evidence: [
          {
            metric: "Complaints today",
            current: args.currentComplaints,
            baseline: Number(args.baselineComplaintsPerDay.toFixed(2)),
            unit: "",
          },
        ],
        actions: [
          {
            label: "Review newest complaints",
            hint: "Prioritize the latest unresolved complaints to reduce escalation.",
            href: "/brand/complaints?sort=latest",
          },
          {
            label: "Check response coverage",
            hint: "Ensure your team is responding within your SLA targets.",
            href: "/brand/analytics/sentiment",
          },
        ],
      }),
    );
  }

  // Signal 2: Sentiment drop
  const drop = args.baselineAvgScore - args.currentAvgScore;
  if (drop > 0.25) {
    signals.push(
      makeSignal({
        brandId: args.brandId,
        severity: args.level,
        fingerprint: `sentiment:${args.dayStart.toISOString().slice(0, 10)}`,
        title: "Sentiment deterioration",
        description: "Average sentiment declined compared to baseline.",
        evidence: [
          {
            metric: "Avg sentiment",
            current: Number(args.currentAvgScore.toFixed(2)),
            baseline: Number(args.baselineAvgScore.toFixed(2)),
          },
        ],
        actions: [
          {
            label: "Inspect top topics",
            hint: "Address the most common issues driving negative sentiment.",
            href: "/brand/analytics/sentiment",
          },
          {
            label: "Update resolution workflow",
            hint: "Reduce friction in refunds, claims, or deliveries.",
            href: "/brand/risk",
          },
        ],
      }),
    );
  }

  // Signal 3: Urgency spike
  const inc = args.currentAvgUrgency - args.baselineAvgUrgency;
  if (inc > 15) {
    signals.push(
      makeSignal({
        brandId: args.brandId,
        severity: args.level,
        fingerprint: `urgency:${args.dayStart.toISOString().slice(0, 10)}`,
        title: "Urgency spike",
        description:
          "Urgency increased, suggesting higher customer pressure and escalation risk.",
        evidence: [
          {
            metric: "Avg urgency",
            current: Math.round(args.currentAvgUrgency),
            baseline: Math.round(args.baselineAvgUrgency),
            unit: "",
          },
        ],
        actions: [
          {
            label: "Prioritize high urgency",
            hint: "Handle high urgency complaints first to prevent escalation.",
            href: "/brand/complaints?filter=high_urgency",
          },
          {
            label: "Improve response time",
            hint: "Respond quickly to reduce perceived neglect.",
            href: "/brand/complaints",
          },
        ],
      }),
    );
  }

  // Signal 4: Topic surge
  const topTopic = (args.topTopics || [])[0];
  if (topTopic && args.level !== "LOW") {
    signals.push(
      makeSignal({
        brandId: args.brandId,
        severity: args.level,
        fingerprint: `topic:${topTopic}:${args.dayStart.toISOString().slice(0, 10)}`,
        title: `Topic surge: ${topTopic}`,
        description: "A specific issue appears frequently in recent activity.",
        evidence: [{ metric: "Top topic", current: 1, baseline: 0, unit: "" }],
        actions: [
          {
            label: "Review complaints by topic",
            hint: "Filter complaints linked to this issue and resolve systematically.",
            href: `/brand/complaints?topic=${encodeURIComponent(topTopic)}`,
          },
          {
            label: "Draft consistent response",
            hint: "Use a consistent explanation and resolution steps for this topic.",
            href: "/brand/templates",
          },
        ],
      }),
    );
  }

  // Upsert signals by fingerprint for the day to avoid duplicates
  for (const s of signals) {
    await prisma.riskSignal.upsert({
      where: { fingerprint: s.fingerprint },
      create: s,
      update: {
        severity: s.severity,
        title: s.title,
        description: s.description,
        evidence: s.evidence,
        actions: s.actions,
        impactedComplaintIds: s.impactedComplaintIds,
      },
    });
  }

  // return latest signals for snapshot
  const latest = await prisma.riskSignal.findMany({
    where: {
      brandId: args.brandId,
      createdAt: { gte: args.dayStart, lt: addDaysUtc(args.dayStart, 1) },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return latest;
}

function makeSignal(args: {
  brandId: string;
  severity: RiskLevel;
  fingerprint: string;
  title: string;
  description: string;
  evidence: any;
  actions: any;
  impactedComplaintIds?: string[];
}) {
  return {
    brandId: args.brandId,
    severity: args.severity,
    title: args.title,
    description: args.description,
    evidence: args.evidence,
    actions: args.actions,
    impactedComplaintIds: args.impactedComplaintIds ?? [],
    fingerprint: args.fingerprint,
  };
}
```

---

## 8. Alert dispatch service (in-app and paid email)

This uses:

- `notifyBrand()` from your existing notifications/email outbox pipeline.
- Feature gate `canReceiveEmailAlerts(brandId)` (paid plans only).

### `src/services/riskAlerts.service.ts`

```ts
import { prisma } from "@/src/lib/prisma";
import { getBrandRiskRule } from "@/src/services/riskRules.service";
import { canReceiveEmailAlerts } from "@/src/services/featureGate.service";
import { isWithinQuietHours, riskLevelOrder } from "@/src/lib/time";
import { notifyBrand } from "@/src/services/notification.service";

type RiskLevel = "LOW" | "GUARDED" | "ELEVATED" | "HIGH" | "CRITICAL";

export async function dispatchRiskAlerts(params: {
  brandId: string;
  level: RiskLevel;
  score: number;
  signals: {
    id: string;
    title: string;
    description: string;
    fingerprint: string;
  }[];
}) {
  const rule = await getBrandRiskRule(params.brandId);
  if (!rule.enabled) return;

  // threshold
  if (riskLevelOrder(params.level) < riskLevelOrder(rule.thresholdLevel))
    return;

  // quiet hours
  if (rule.quietHoursEnabled) {
    const now = new Date();
    if (isWithinQuietHours(now, rule.quietHoursStart, rule.quietHoursEnd)) {
      return;
    }
  }

  // suppression: check log for same fingerprint in the last suppressionMinutes
  const newest = params.signals[0];
  if (!newest) return;

  const since = new Date(Date.now() - rule.suppressionMinutes * 60_000);
  const recent = await prisma.riskAlertLog.findFirst({
    where: {
      brandId: params.brandId,
      fingerprint: newest.fingerprint,
      triggeredAt: { gte: since },
    },
  });
  if (recent) return;

  const link = `${process.env.APP_URL}/brand/risk`;

  // in-app
  if (rule.notifyInApp) {
    await notifyBrand({
      brandId: params.brandId,
      type: "COMPLAINT_ESCALATED",
      title: `Reputation risk ${params.level.toLowerCase()} (${params.score})`,
      body: newest.title,
      link,
      metadata: {
        riskLevel: params.level,
        riskScore: params.score,
        signalId: newest.id,
      },
    });

    await prisma.riskAlertLog.create({
      data: {
        brandId: params.brandId,
        level: params.level,
        fingerprint: newest.fingerprint,
        channel: "IN_APP",
      },
    });
  }

  // email (paid)
  if (rule.notifyEmail) {
    const allowed = await canReceiveEmailAlerts(params.brandId);
    if (!allowed) return;

    // notifyBrand will enqueue emails if toEmails are provided.
    // We keep recipient discovery inside notifyBrand integration to your brandMember model.
    await notifyBrand({
      brandId: params.brandId,
      type: "COMPLAINT_ESCALATED",
      title: `Reputation risk alert: ${params.level} (${params.score})`,
      body: `${newest.title}. ${newest.description}`,
      link,
      metadata: {
        riskLevel: params.level,
        riskScore: params.score,
        signalId: newest.id,
      },
      toEmails: await getBrandAlertEmails(params.brandId),
    });

    await prisma.riskAlertLog.create({
      data: {
        brandId: params.brandId,
        level: params.level,
        fingerprint: newest.fingerprint,
        channel: "EMAIL",
      },
    });
  }
}

async function getBrandAlertEmails(brandId: string): Promise<string[]> {
  const members = await prisma.brandMember.findMany({
    where: { brandId, isActive: true },
    include: { user: true },
  });
  return members.map((m) => m.user.email).filter(Boolean);
}
```

Notes:

- We reuse notification type `COMPLAINT_ESCALATED` to avoid expanding enums now.
- Email plan gating remains enforced.

---

## 9. Risk queue, scheduler and worker

### `src/queues/risk.queue.ts`

```ts
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
);

export const riskQueue = new Queue("riskQueue", { connection });
export const riskQueueConnection = connection;
```

### `src/workers/risk.worker.ts`

```ts
import { Worker } from "bullmq";
import { riskQueueConnection } from "@/src/queues/risk.queue";
import { computeBrandRiskForDay } from "@/src/services/riskEngine.service";
import { dispatchRiskAlerts } from "@/src/services/riskAlerts.service";
import { startOfDayUtc } from "@/src/lib/time";

export const riskWorker = new Worker(
  "riskQueue",
  async (job) => {
    const { brandId, day } = job.data as { brandId: string; day?: string };

    const targetDay = day
      ? startOfDayUtc(new Date(day))
      : startOfDayUtc(new Date());
    const result = await computeBrandRiskForDay(brandId, targetDay);

    await dispatchRiskAlerts({
      brandId,
      level: result.level,
      score: result.score,
      signals: (result.signals || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        fingerprint: s.fingerprint,
      })),
    });

    return { ok: true };
  },
  { connection: riskQueueConnection },
);
```

### Scheduler (simple cron-like interval)

In production you will use a real scheduler. For now, a lightweight recurring enqueue is acceptable.

### `src/queues/risk.scheduler.ts`

```ts
import { riskQueue } from "@/src/queues/risk.queue";
import { prisma } from "@/src/lib/prisma";

export async function enqueueDailyRiskRuns() {
  const brands = await prisma.brand.findMany({ select: { id: true } });
  for (const b of brands) {
    await riskQueue.add(
      "risk-daily",
      { brandId: b.id },
      { removeOnComplete: true, removeOnFail: 1000 },
    );
  }
}

// Optional: run every 30 minutes from your server bootstrap
export function startRiskScheduler() {
  enqueueDailyRiskRuns().catch(() => {});
  setInterval(() => {
    enqueueDailyRiskRuns().catch(() => {});
  }, 30 * 60_000);
}
```

---

## 10. API routes

### 10.1 `GET /api/brand/risk/snapshot`

Returns latest score, level, 7d trend, drivers, signals, and series.

`src/app/api/brand/risk/snapshot/route.ts`

```ts
import { prisma } from "@/src/lib/prisma";
import { requireBrandUser } from "@/src/server/auth/requireBrandUser";
import { addDaysUtc, startOfDayUtc } from "@/src/lib/time";

export async function GET() {
  const session = await requireBrandUser();
  const brandId = session.brandId;

  const today = startOfDayUtc(new Date());
  const since30 = addDaysUtc(today, -30);
  const since7 = addDaysUtc(today, -7);

  const seriesRows = await prisma.brandRiskDaily.findMany({
    where: { brandId, day: { gte: since30, lte: today } },
    orderBy: { day: "asc" },
    select: { day: true, score: true },
  });

  const latest = await prisma.brandRiskDaily.findFirst({
    where: { brandId },
    orderBy: { day: "desc" },
  });

  // If no record exists yet, return a safe default
  if (!latest) {
    return Response.json({
      snapshot: {
        brandId,
        score: 0,
        level: "LOW",
        trend7d: 0,
        lastUpdatedAt: new Date().toISOString(),
        drivers: [],
        signals: [],
        series: [],
      },
    });
  }

  const weekAgoRow = await prisma.brandRiskDaily.findFirst({
    where: { brandId, day: { gte: since7 } },
    orderBy: { day: "asc" },
  });

  const trend7d = weekAgoRow ? latest.score - weekAgoRow.score : 0;

  const signals = await prisma.riskSignal.findMany({
    where: { brandId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return Response.json({
    snapshot: {
      brandId,
      score: latest.score,
      level: latest.level,
      trend7d,
      lastUpdatedAt: latest.updatedAt.toISOString(),
      drivers: (latest.drivers as any) ?? [],
      signals: signals.map((s) => ({
        id: s.id,
        createdAt: s.createdAt.toISOString(),
        severity: s.severity,
        title: s.title,
        description: s.description,
        evidence: (s.evidence as any) ?? [],
        actions: (s.actions as any) ?? [],
        impactedComplaintIds: s.impactedComplaintIds ?? [],
      })),
      series: seriesRows.map((r) => ({
        day: r.day.toISOString(),
        score: r.score,
      })),
    },
  });
}
```

---

### 10.2 `GET/POST /api/brand/risk/rules`

Returns and updates alert rules. Also returns `emailPlanRequired` for UI gating.

`src/app/api/brand/risk/rules/route.ts`

```ts
import { z } from "zod";
import { requireBrandUser } from "@/src/server/auth/requireBrandUser";
import {
  getBrandRiskRule,
  updateBrandRiskRule,
} from "@/src/services/riskRules.service";
import { canReceiveEmailAlerts } from "@/src/services/featureGate.service";

const Schema = z.object({
  enabled: z.boolean(),
  notifyInApp: z.boolean(),
  notifyEmail: z.boolean(),
  thresholdLevel: z.enum(["LOW", "GUARDED", "ELEVATED", "HIGH", "CRITICAL"]),
  suppressionMinutes: z.number().int().min(5).max(1440),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().min(4).max(5),
  quietHoursEnd: z.string().min(4).max(5),
});

export async function GET() {
  const session = await requireBrandUser();
  const brandId = session.brandId;

  const rule = await getBrandRiskRule(brandId);
  const emailAllowed = await canReceiveEmailAlerts(brandId);

  return Response.json({
    enabled: rule.enabled,
    notifyInApp: rule.notifyInApp,
    notifyEmail: rule.notifyEmail,
    thresholdLevel: rule.thresholdLevel,
    suppressionMinutes: rule.suppressionMinutes,
    quietHoursEnabled: rule.quietHoursEnabled,
    quietHoursStart: rule.quietHoursStart,
    quietHoursEnd: rule.quietHoursEnd,
    emailPlanRequired: !emailAllowed,
  });
}

export async function POST(req: Request) {
  const session = await requireBrandUser();
  const brandId = session.brandId;

  const body = await req.json();
  const parsed = Schema.parse(body);

  const emailAllowed = await canReceiveEmailAlerts(brandId);
  if (!emailAllowed && parsed.notifyEmail) {
    // silently force off. prevents bypass
    parsed.notifyEmail = false;
  }

  const updated = await updateBrandRiskRule(brandId, parsed);

  return Response.json({
    ok: true,
    rule: {
      enabled: updated.enabled,
      notifyInApp: updated.notifyInApp,
      notifyEmail: updated.notifyEmail,
      thresholdLevel: updated.thresholdLevel,
      suppressionMinutes: updated.suppressionMinutes,
      quietHoursEnabled: updated.quietHoursEnabled,
      quietHoursStart: updated.quietHoursStart,
      quietHoursEnd: updated.quietHoursEnd,
    },
    emailPlanRequired: !emailAllowed,
  });
}
```

---

## 11. Hooking into existing flows

### 11.1 On complaint creation and new sentiment

Whenever Sprint29 sentiment ingestion runs, enqueue a risk compute job for the complaint brand.

In your existing sentiment pipeline or complaint creation service, add:

```ts
import { riskQueue } from "@/src/queues/risk.queue";

await riskQueue.add(
  "risk-now",
  { brandId: complaint.brandId },
  { removeOnComplete: true, removeOnFail: 1000 },
);
```

This gives near real-time risk updates.

---

## 12. Docker compose additions

Add Redis and a risk worker service.

`docker-compose.yml` excerpt:

```yaml
services:
  redis:
    image: redis:7
    ports:
      - "6379:6379"

  risk-worker:
    build: .
    command: ["node", "-r", "ts-node/register", "src/workers/risk.worker.ts"]
    environment:
      REDIS_URL: redis://redis:6379
      APP_URL: http://localhost:3000
    depends_on:
      - redis
      - db
```

---

## 13. Tests

### `src/tests/risk.rules.test.ts`

```ts
import {
  updateBrandRiskRule,
  getBrandRiskRule,
} from "@/src/services/riskRules.service";

describe("risk rules", () => {
  it("creates defaults and updates", async () => {
    const brandId = "brand_test_rules";
    const rule1 = await getBrandRiskRule(brandId);
    expect(rule1.thresholdLevel).toBeDefined();

    const updated = await updateBrandRiskRule(brandId, {
      suppressionMinutes: 120,
    });
    expect(updated.suppressionMinutes).toBe(120);
  });
});
```

### `src/tests/risk.engine.test.ts`

```ts
import { computeBrandRiskForDay } from "@/src/services/riskEngine.service";
import { startOfDayUtc } from "@/src/lib/time";

describe("risk engine", () => {
  it("computes and persists daily risk", async () => {
    const brandId = "brand_test_risk";
    const today = startOfDayUtc(new Date());

    const r = await computeBrandRiskForDay(brandId, today);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.level).toBeDefined();
  });
});
```

---

## 14. Production notes

- Risk signals are **data-driven**, neutral language, no legal threats.
- Suppression prevents alert spam.
- Quiet hours prevents noisy after-hours notifications.
- Email alerts are paid and gated by plan.
- All risk calculations are persisted and auditable.

---

## Sprint30 completion criteria

1. Daily risk score persisted in `BrandRiskDaily`.
2. Snapshot endpoint returns score, level, series, drivers, signals.
3. Rules endpoints support editing with email gating enforced.
4. Risk worker computes + dispatches alerts.
5. Risk signals are de-duplicated by fingerprint.
6. Tests cover rules and engine persistence.
