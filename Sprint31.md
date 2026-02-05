# Sprint31.md

## Sprint 31. Premium Widgets System (TrustLens)

### Goal

Deliver a secure, fast, premium-grade widgets system for TrustLens with domain enforcement, widget keys, multi-location support, and a premium "Reputation Summary" widget layout (heading left, summary right, review cards below). Widgets must be iframe-friendly and match the TrustLens design language.

### Scope

- Public widget routes rendered in Next.js App Router
- Public widget APIs with caching headers
- Premium gating via widget plan, widget keys, and domain allowlist
- Multi-location selector support for Premium
- Watermark removal for Premium
- Metrics pre-aggregation table (daily metrics) with a simple backfill job stub
- Brand dashboard settings screens for widget configuration (basic form)

### Deliverables

- Widget runtime. embed via iframe
- Premium Widget A. Reputation Summary Panel
- Public APIs. brand summary + recent resolutions feed
- Widget auth. key validation + domain allowlist checks
- Prisma schema additions for brands, locations, widget keys, daily metrics
- Basic tests for domain enforcement and API responses

### Exit criteria

- A brand with FREE plan sees watermark and no location selector
- A brand with PRO plan sees no watermark, location selector, and advanced KPIs
- Embedding on an unauthorized domain returns an "Unauthorized embed" widget state
- Public widget APIs return no PII and are cacheable
- Widgets render correctly inside an iframe with dark and light themes

---

## 1. FILE ARCHITECTURE

frontend/
├── app/
│ ├── widgets/
│ │ ├── \_shared/
│ │ │ ├── widget-shell.tsx
│ │ │ ├── widget-unauthorized.tsx
│ │ │ ├── widget-watermark.tsx
│ │ │ ├── stars.tsx
│ │ │ └── location-selector.tsx
│ │ ├── reviews/
│ │ │ ├── page.tsx
│ │ │ └── reviews-widget.tsx
│ │ ├── reputation-summary/
│ │ │ ├── page.tsx
│ │ │ └── reputation-summary-widget.tsx
│ │ └── resolved-counter/
│ │ ├── page.tsx
│ │ └── resolved-counter-widget.tsx
│ ├── api/
│ │ ├── public/
│ │ │ └── widgets/
│ │ │ ├── brand-summary/route.ts
│ │ │ └── recent-resolutions/route.ts
│ │ └── brand/
│ │ └── widgets/
│ │ ├── settings/route.ts
│ │ └── keys/route.ts
│ ├── layout.tsx
│ ├── globals.css
│ └── providers.tsx
├── components/
│ ├── DarkModeToggle.tsx
│ ├── InputField.tsx
│ ├── Button.tsx
│ └── Toast.tsx
├── lib/
│ ├── db.ts
│ ├── authOptions.ts
│ ├── widget-auth.ts
│ ├── widget-metrics.ts
│ └── validators.ts
├── prisma/
│ ├── schema.prisma
│ └── migrations/
└── tests/
├── widget-auth.test.ts
└── widgets-api.test.ts

---

## 2. DEPENDENCIES

<!-- npm install next react react-dom
npm install tailwindcss postcss autoprefixer
npm install next-auth @next-auth/prisma-adapter @prisma/client
npm install axios zustand classnames
npm install lucide-react next-themes
npm install zod
npm install --save-dev typescript jest @testing-library/react @testing-library/jest-dom @testing-library/user-event -->

Optional for rate limiting:
npm install @upstash/ratelimit @upstash/redis

---

## 3. TAILWIND CONFIGURATION

frontend/tailwind.config.js

```js
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#13b6ec",
        "background-light": "#f6f8f8",
        "background-dark": "#101d22",
      },
      fontFamily: { display: ["Manrope", "sans-serif"] },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
```

---

## 4. PRISMA. DATA MODEL CHANGES

frontend/prisma/schema.prisma

```prisma
enum WidgetPlan {
  FREE
  PRO
  BUSINESS
}

model Brand {
  id                    String      @id @default(cuid())
  name                  String
  slug                  String      @unique

  widgetPlan            WidgetPlan  @default(FREE)
  widgetWatermark       Boolean     @default(true)
  widgetRoutingEnabled  Boolean     @default(true)

  allowedDomains        String[]    @default([])
  defaultTheme          String      @default("light")

  googlePlaceId         String?
  googleReviewUrl       String?

  locations             BrandLocation[]
  widgetKeys            WidgetKey[]
  dailyMetrics          BrandDailyMetrics[]

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
}

model BrandLocation {
  id            String   @id @default(cuid())
  brandId       String
  brand         Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)

  name          String
  slug          String
  googlePlaceId String?

  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([brandId, slug])
}

model WidgetKey {
  id          String   @id @default(cuid())
  brandId     String
  brand       Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)

  key         String   @unique
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  lastUsedAt  DateTime?
}

model BrandDailyMetrics {
  id                         String   @id @default(cuid())
  brandId                    String
  brand                      Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)

  locationId                 String?
  location                   BrandLocation? @relation(fields: [locationId], references: [id], onDelete: SetNull)

  date                       DateTime

  complaintsOpened           Int      @default(0)
  complaintsResolved         Int      @default(0)
  responseRatePct            Float    @default(0)
  medianFirstResponseMinutes Int      @default(0)
  medianResolutionMinutes    Int      @default(0)
  trustScore                 Int      @default(0)
  sentimentAvg               Float    @default(0)
  sentimentDelta30d          Float    @default(0)

  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt

  @@index([brandId, date])
  @@index([brandId, locationId, date])
  @@unique([brandId, locationId, date])
}
```

Run:

- npx prisma migrate dev
- npx prisma generate

---

## 5. WIDGET AUTH. PREMIUM ENFORCEMENT + DOMAIN ALLOWLIST

frontend/lib/widget-auth.ts

```ts
import { z } from "zod";
import db from "./db";

const AllowedTheme = z.enum(["light", "dark"]);
export type WidgetTheme = z.infer<typeof AllowedTheme>;

export function parseTheme(input: unknown): WidgetTheme {
  const t = typeof input === "string" ? input : "light";
  return AllowedTheme.safeParse(t).success ? (t as WidgetTheme) : "light";
}

function normalizeHost(raw: string) {
  try {
    const url = raw.startsWith("http")
      ? new URL(raw)
      : new URL(`https://${raw}`);
    return url.host.toLowerCase();
  } catch {
    return "";
  }
}

export async function authorizeWidgetEmbed(params: {
  brandSlug: string;
  widgetKey?: string;
  referer?: string | null;
  origin?: string | null;
}) {
  const brand = await db.brand.findUnique({
    where: { slug: params.brandSlug },
    include: { widgetKeys: true, locations: true },
  });

  if (!brand) {
    return { ok: false as const, reason: "brand_not_found" as const };
  }

  if (!brand.widgetRoutingEnabled) {
    return { ok: false as const, reason: "widgets_disabled" as const };
  }

  // Key enforcement. Required for PREMIUM and optional for FREE and GROWTH.
  const requiresKey = brand.widgetPlan === "BUSINESS";
  const key = params.widgetKey?.trim() || "";

  if (requiresKey) {
    if (!key) return { ok: false as const, reason: "missing_key" as const };

    const keyRow = brand.widgetKeys.find((k) => k.key === key && k.isActive);
    if (!keyRow) return { ok: false as const, reason: "invalid_key" as const };

    await db.widgetKey.update({
      where: { id: keyRow.id },
      data: { lastUsedAt: new Date() },
    });
  }

  // Domain allowlist enforcement for GROWTH and PREMIUM.
  const requiresDomainLock = brand.widgetPlan !== "FREE";
  if (requiresDomainLock) {
    const ref = params.origin || params.referer || "";
    const host = normalizeHost(ref);

    if (!host)
      return { ok: false as const, reason: "missing_referer" as const };

    const allowed = (brand.allowedDomains || [])
      .map((d) => normalizeHost(d))
      .filter(Boolean);
    const isAllowed = allowed.some((a) => a === host);

    if (!isAllowed)
      return { ok: false as const, reason: "domain_not_allowed" as const };
  }

  return {
    ok: true as const,
    brand,
    isPremium: brand.widgetPlan === "BUSINESS",
    showWatermark: brand.widgetPlan === "FREE" && brand.widgetWatermark,
  };
}
```

---

## 6. PUBLIC WIDGET APIs (NO PII)

### 6.1 Brand summary API

frontend/app/api/public/widgets/brand-summary/route.ts

```ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authorizeWidgetEmbed, parseTheme } from "@/lib/widget-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const brand = url.searchParams.get("brand") || "";
  const key = url.searchParams.get("key") || undefined;

  const theme = parseTheme(url.searchParams.get("theme"));
  const location = url.searchParams.get("location") || "all";

  const auth = await authorizeWidgetEmbed({
    brandSlug: brand,
    widgetKey: key,
    referer: req.headers.get("referer"),
    origin: req.headers.get("origin"),
  });

  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, reason: auth.reason },
      { status: 403 },
    );
  }

  const today = new Date();
  const start = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 30);

  const locationId =
    location === "all"
      ? null
      : auth.brand.locations.find((l) => l.slug === location && l.isActive)
          ?.id || null;

  const latest = await db.brandDailyMetrics.findFirst({
    where: { brandId: auth.brand.id, locationId },
    orderBy: { date: "desc" },
  });

  const trend = await db.brandDailyMetrics.findMany({
    where: { brandId: auth.brand.id, locationId, date: { gte: start } },
    orderBy: { date: "asc" },
    select: { date: true, complaintsOpened: true, complaintsResolved: true },
  });

  const payload = {
    ok: true,
    theme,
    plan: auth.brand.widgetPlan,
    showWatermark: auth.showWatermark,
    brand: {
      name: auth.brand.name,
      slug: auth.brand.slug,
    },
    kpis: latest
      ? {
          trustScore: latest.trustScore,
          responseRatePct: latest.responseRatePct,
          medianFirstResponseMinutes: latest.medianFirstResponseMinutes,
          medianResolutionMinutes: latest.medianResolutionMinutes,
          sentimentDelta30d: latest.sentimentDelta30d,
        }
      : null,
    trend,
    locations: auth.isPremium
      ? auth.brand.locations
          .filter((l) => l.isActive)
          .map((l) => ({ name: l.name, slug: l.slug }))
      : [],
  };

  const res = NextResponse.json(payload);
  res.headers.set(
    "Cache-Control",
    "public, s-maxage=120, stale-while-revalidate=600",
  );
  return res;
}
```

### 6.2 Recent resolutions API

frontend/app/api/public/widgets/recent-resolutions/route.ts

```ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authorizeWidgetEmbed } from "@/lib/widget-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const brand = url.searchParams.get("brand") || "";
  const key = url.searchParams.get("key") || undefined;

  const limitRaw = parseInt(url.searchParams.get("limit") || "6", 10);
  const limit = Math.min(Math.max(limitRaw, 1), 10);

  const auth = await authorizeWidgetEmbed({
    brandSlug: brand,
    widgetKey: key,
    referer: req.headers.get("referer"),
    origin: req.headers.get("origin"),
  });

  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, reason: auth.reason },
      { status: 403 },
    );
  }

  // Replace this query with your actual Review or Complaint resolved feed table.
  // Important. No names, no emails, no phone numbers.
  const items = await db.complaint.findMany({
    where: {
      brandId: auth.brand.id,
      status: "RESOLVED_CONFIRMED",
      isPublic: true,
    },
    orderBy: { resolvedConfirmedAt: "desc" },
    take: limit,
    select: {
      id: true,
      category: true,
      resolvedConfirmedAt: true,
      timeToResolveMinutes: true,
      outcomeTag: true,
    },
  });

  const payload = {
    ok: true,
    items: items.map((i) => ({
      id: i.id,
      category: i.category,
      resolvedAt: i.resolvedConfirmedAt,
      timeToResolveMinutes: i.timeToResolveMinutes,
      outcomeTag: i.outcomeTag,
    })),
  };

  const res = NextResponse.json(payload);
  res.headers.set(
    "Cache-Control",
    "public, s-maxage=120, stale-while-revalidate=600",
  );
  return res;
}
```

Note. The `complaint` model fields referenced above must exist in your backend schema. If your complaint table differs, map the select fields accordingly.

---

## 7. WIDGET SHELL. IFRAME FRIENDLY + UNAUTHORIZED STATE

frontend/app/widgets/\_shared/widget-shell.tsx

```tsx
import WidgetUnauthorized from "./widget-unauthorized";
import WidgetWatermark from "./widget-watermark";

type Props = {
  ok: boolean;
  reason?: string;
  theme: "light" | "dark";
  showWatermark?: boolean;
  children: React.ReactNode;
};

export default function WidgetShell(props: Props) {
  return (
    <html lang="en" className={props.theme === "dark" ? "dark" : ""}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`html,body{margin:0;padding:0;background:transparent;}`}</style>
      </head>
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        {!props.ok ? (
          <WidgetUnauthorized reason={props.reason || "unauthorized"} />
        ) : (
          <div className="relative">
            {props.children}
            {props.showWatermark ? <WidgetWatermark /> : null}
          </div>
        )}
      </body>
    </html>
  );
}
```

frontend/app/widgets/\_shared/widget-unauthorized.tsx

```tsx
export default function WidgetUnauthorized({ reason }: { reason: string }) {
  return (
    <div className="flex min-h-[220px] w-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="text-base font-semibold">Widget unavailable</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          This widget cannot load on this domain.
        </div>
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
          Reason. {reason}
        </div>
      </div>
    </div>
  );
}
```

frontend/app/widgets/\_shared/widget-watermark.tsx

```tsx
export default function WidgetWatermark() {
  return (
    <div className="pointer-events-none absolute bottom-3 right-4 text-xs text-slate-400 dark:text-slate-600">
      Powered by <span className="font-semibold">Trust</span>
      <span className="font-semibold text-sky-500">Lens</span>
    </div>
  );
}
```

---

## 8. PREMIUM WIDGET A. REPUTATION SUMMARY PANEL (HOW IT LOOKS)

- Left. Heading block, large typography
- Right. Summary card, stars optional, KPI tiles
- Bottom. Feed of verified outcomes

### Route

frontend/app/widgets/reputation-summary/page.tsx

```tsx
import WidgetShell from "../_shared/widget-shell";
import ReputationSummaryWidget from "./reputation-summary-widget";
import { parseTheme } from "@/lib/widget-auth";

export const dynamic = "force-dynamic";

export default async function ReputationSummaryPage({
  searchParams,
}: {
  searchParams: {
    brand?: string;
    theme?: string;
    key?: string;
    location?: string;
    limit?: string;
  };
}) {
  const brand = searchParams.brand || "";
  const theme = parseTheme(searchParams.theme);
  const key = searchParams.key;
  const location = searchParams.location || "all";
  const limit = Math.min(
    Math.max(parseInt(searchParams.limit || "6", 10), 1),
    10,
  );

  const qs = new URLSearchParams({ brand, theme, location });
  if (key) qs.set("key", key);

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const [summaryRes, feedRes] = await Promise.all([
    fetch(`${base}/api/public/widgets/brand-summary?${qs.toString()}`, {
      cache: "no-store",
    }),
    fetch(
      `${base}/api/public/widgets/recent-resolutions?${new URLSearchParams({ brand, ...(key ? { key } : {}), limit: String(limit) }).toString()}`,
      { cache: "no-store" },
    ),
  ]);

  const summary = await summaryRes.json();
  const feed = await feedRes.json();

  const ok = summary?.ok === true && feed?.ok === true;

  return (
    <WidgetShell
      ok={ok}
      reason={!ok ? summary?.reason || feed?.reason : undefined}
      theme={theme}
      showWatermark={summary?.showWatermark}
    >
      <ReputationSummaryWidget summary={summary} feed={feed} />
    </WidgetShell>
  );
}
```

### Widget UI

frontend/app/widgets/reputation-summary/reputation-summary-widget.tsx

```tsx
import LocationSelector from "../_shared/location-selector";

type Props = {
  summary: any;
  feed: any;
};

export default function ReputationSummaryWidget({ summary, feed }: Props) {
  const brandName = summary?.brand?.name || "Brand";
  const k = summary?.kpis;

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Trust performance
                <br />
                for {brandName}
              </h2>

              {summary?.locations?.length ? (
                <div className="hidden lg:block">
                  <LocationSelector locations={summary.locations} />
                </div>
              ) : null}
            </div>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Verified outcomes shown only after resolution. Premium widgets
              unlock multi-location insights and advanced trends.
            </p>
          </div>

          <div className="lg:border-l lg:border-slate-200 lg:pl-10 dark:lg:border-slate-800">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-500">
                    Trust Score
                  </div>
                  <div className="mt-1 text-4xl font-semibold">
                    {k ? k.trustScore : "0"}
                    <span className="text-base font-semibold text-slate-500 dark:text-slate-500">
                      /100
                    </span>
                  </div>
                </div>

                {summary?.locations?.length ? (
                  <div className="lg:hidden">
                    <LocationSelector locations={summary.locations} />
                  </div>
                ) : null}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Kpi
                  label="Response rate"
                  value={k ? `${Math.round(k.responseRatePct)}%` : "0%"}
                />
                <Kpi
                  label="First response"
                  value={k ? minutesToNice(k.medianFirstResponseMinutes) : "-"}
                />
                <Kpi
                  label="Time to resolve"
                  value={k ? minutesToNice(k.medianResolutionMinutes) : "-"}
                />
                <Kpi
                  label="Sentiment delta"
                  value={k ? formatDelta(k.sentimentDelta30d) : "0"}
                />
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900/40">
                <div className="font-semibold">Verified outcomes</div>
                <a
                  className="text-primary hover:underline"
                  href={`/brands/${summary?.brand?.slug || ""}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View full report
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(feed?.items || []).map((i: any) => (
            <OutcomeCard
              key={i.id}
              category={i.category}
              resolvedAt={i.resolvedAt}
              minutes={i.timeToResolveMinutes}
              outcomeTag={i.outcomeTag}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="text-xs text-slate-500 dark:text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}

function OutcomeCard(props: {
  category: string;
  resolvedAt: string;
  minutes: number;
  outcomeTag: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">
          {props.category || "General"}
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          Verified
        </span>
      </div>

      <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        Outcome.{" "}
        <span className="font-semibold text-slate-900 dark:text-slate-50">
          {props.outcomeTag || "Resolved"}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
        <span>
          {props.resolvedAt
            ? new Date(props.resolvedAt).toLocaleDateString("en-ZA")
            : "-"}
        </span>
        <span>{props.minutes ? minutesToNice(props.minutes) : "-"}</span>
      </div>
    </div>
  );
}

function minutesToNice(m: number) {
  if (!Number.isFinite(m) || m <= 0) return "-";
  const hours = Math.round(m / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function formatDelta(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}`;
}
```

### Location selector shared component

frontend/app/widgets/\_shared/location-selector.tsx

```tsx
"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LocationSelector({
  locations,
}: {
  locations: Array<{ name: string; slug: string }>;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const current = params.get("location") || "all";

  const options = useMemo(() => {
    return [{ name: "All locations", slug: "all" }, ...locations];
  }, [locations]);

  return (
    <select
      value={current}
      onChange={(e) => {
        const next = new URLSearchParams(params.toString());
        next.set("location", e.target.value);
        router.replace(`?${next.toString()}`);
      }}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
    >
      {options.map((o) => (
        <option key={o.slug} value={o.slug}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
```

---

## 9. EMBED SNIPPET

### Premium embed (requires key)

```html
<iframe
  src="https://trustlens.co/widgets/reputation-summary?brand=acme&theme=light&key=wk_live_xxx&location=all"
  style="border:0;width:100%;height:720px;border-radius:16px;overflow:hidden;"
  loading="lazy"
></iframe>
```

### Free embed (watermark, no key)

```html
<iframe
  src="https://trustlens.co/widgets/reviews?brand=acme&theme=light&limit=4"
  style="border:0;width:100%;height:560px;border-radius:16px;overflow:hidden;"
  loading="lazy"
></iframe>
```

---

## 10. BRAND WIDGET SETTINGS API (BASIC)

frontend/app/api/brand/widgets/settings/route.ts

```ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { z } from "zod";

const Schema = z.object({
  allowedDomains: z.array(z.string()).default([]),
  widgetWatermark: z.boolean().optional(),
  widgetRoutingEnabled: z.boolean().optional(),
  defaultTheme: z.enum(["light", "dark"]).optional(),
});

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = Schema.parse(await req.json());

  // Map this to your own brand ownership logic.
  const brandId = (session.user as any).brandId as string;
  if (!brandId) return NextResponse.json({ ok: false }, { status: 403 });

  const updated = await db.brand.update({
    where: { id: brandId },
    data: {
      allowedDomains: body.allowedDomains,
      widgetWatermark: body.widgetWatermark,
      widgetRoutingEnabled: body.widgetRoutingEnabled,
      defaultTheme: body.defaultTheme,
    },
    select: {
      id: true,
      allowedDomains: true,
      widgetWatermark: true,
      widgetPlan: true,
    },
  });

  return NextResponse.json({ ok: true, brand: updated });
}
```

### Widget key management

frontend/app/api/brand/widgets/keys/route.ts

```ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import crypto from "crypto";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });

  const brandId = (session.user as any).brandId as string;
  if (!brandId) return NextResponse.json({ ok: false }, { status: 403 });

  const key = `wk_live_${crypto.randomBytes(18).toString("hex")}`;

  const row = await db.widgetKey.create({
    data: { brandId, key },
    select: { id: true, key: true, isActive: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, key: row });
}
```

---

## 11. METRICS JOB STUB (DAILY AGGREGATION)

This is a stub. Replace with your actual complaint and response tables.

frontend/lib/widget-metrics.ts

```ts
import db from "./db";

export async function computeBrandDailyMetrics(date: Date) {
  // Replace with real queries.
  // Recommendation. compute for each brand and each location.
  const brands = await db.brand.findMany({ select: { id: true } });

  for (const b of brands) {
    await db.brandDailyMetrics.upsert({
      where: {
        brandId_locationId_date: { brandId: b.id, locationId: null, date },
      },
      update: {
        complaintsOpened: 0,
        complaintsResolved: 0,
        responseRatePct: 0,
        medianFirstResponseMinutes: 0,
        medianResolutionMinutes: 0,
        trustScore: 0,
        sentimentAvg: 0,
        sentimentDelta30d: 0,
      },
      create: {
        brandId: b.id,
        locationId: null,
        date,
        complaintsOpened: 0,
        complaintsResolved: 0,
        responseRatePct: 0,
        medianFirstResponseMinutes: 0,
        medianResolutionMinutes: 0,
        trustScore: 0,
        sentimentAvg: 0,
        sentimentDelta30d: 0,
      },
    });
  }
}
```

---

## 12. TESTS

frontend/tests/widget-auth.test.ts

```ts
import { authorizeWidgetEmbed } from "@/lib/widget-auth";

test("rejects missing key for premium", async () => {
  const res = await authorizeWidgetEmbed({
    brandSlug: "premium-brand",
    widgetKey: "",
    referer: "https://allowed.example.com",
    origin: "https://allowed.example.com",
  });

  // This is a structural test. Use a seeded test DB in your environment.
  expect(res.ok).toBe(false);
});
```

frontend/tests/widgets-api.test.ts

```ts
test("brand summary api returns no pii fields", async () => {
  const res = await fetch(
    "http://localhost:3000/api/public/widgets/brand-summary?brand=acme",
  );
  const json = await res.json();
  if (json.ok) {
    expect(json.brand).toBeTruthy();
    expect(json).not.toHaveProperty("email");
    expect(json).not.toHaveProperty("phone");
  }
});
```

---

## 13. NOTES ON PREMIUM LOOK AND FEEL

Premium differences must be obvious:

- No watermark
- Location selector visible
- KPI tiles shown
- Verified outcomes feed expanded
- Domain locked and key protected

Free differences:

- Watermark shown
- No location selector
- Minimal KPIs or none

---

## 14. IMPLEMENTATION CHECKLIST

- [ ] Add Prisma models and migrate
- [ ] Seed at least one brand with PREMIUM plan
- [ ] Add allowed domains for the premium brand
- [ ] Create a widget key for that brand
- [ ] Render reputation-summary widget with key on an allowed domain
- [ ] Confirm unauthorized domain shows widget unavailable state
- [ ] Confirm watermark behavior based on plan

---

## 15. FUTURE UPGRADE PATH

- Add rate limiting by key and IP
- Add webhooks or incremental aggregation for metrics
- Add more premium layouts. compact, horizontal, chart focused
- Add signed embed tokens for strict security if needed
