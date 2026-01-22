Sprint29.md. AI-driven Sentiment Tracking

1. Goals

Track sentiment for every complaint and message.

Aggregate trends per brand over time.

Power dashboards and paid alerts (email alerts already gated).

Be auditable. Store raw AI output and model metadata.

Be safe. Use moderation checks where needed.

2. Dependency Injection

Install:

npm i openai zod
npm i bullmq ioredis
npm i date-fns
npm i --save-dev jest ts-jest supertest

OpenAI uses the Responses API and Structured Outputs.

3. Environment Variables

.env

OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.2
OPENAI_SENTIMENT_MODEL=gpt-5.2
OPENAI_MODERATION_MODEL=omni-moderation-latest

APP_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379

Moderation model reference.

4. Database. Prisma schema

Add to prisma/schema.prisma.

enum SentimentLabel {
VERY_NEGATIVE
NEGATIVE
NEUTRAL
POSITIVE
VERY_POSITIVE
}

enum SentimentSourceType {
COMPLAINT
BRAND_RESPONSE
CONSUMER_MESSAGE
SYSTEM_NOTE
}

model SentimentEvent {
id String @id @default(uuid())
brandId String @index
complaintId String? @index
sourceType SentimentSourceType
sourceId String? @index // messageId, responseId, etc
textHash String @index
language String? // "en", "af", etc

label SentimentLabel
score Float // -1.0 to +1.0
intensity Float // 0.0 to 1.0
urgency Int // 0 to 100
topics String[] // ["billing","delivery"]
keyPhrases String[] // short phrases

model String
provider String @default("openai")
moderationFlagged Boolean @default(false)
moderationRaw Json?
raw Json? // full structured output + reasoning metadata
createdAt DateTime @default(now())

@@index([brandId, createdAt])
}

model BrandSentimentDaily {
id String @id @default(uuid())
brandId String @index
day DateTime @index // store midnight UTC
count Int
avgScore Float
avgUrgency Float
positivePct Float
negativePct Float
neutralPct Float
topTopics String[]
updatedAt DateTime @updatedAt

@@unique([brandId, day])
}

model ComplaintSentimentSnapshot {
id String @id @default(uuid())
complaintId String @unique
brandId String @index
lastEventAt DateTime
currentLabel SentimentLabel
currentScore Float
currentUrgency Int
topics String[]
updatedAt DateTime @updatedAt
}

Run:

npx prisma migrate dev -n sprint29_sentiment_tracking

5. OpenAI client
   src/lib/openai.ts
   import OpenAI from "openai"

export const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
})

Responses API is the recommended interface.

6. Sentiment schema. Structured Outputs

We force valid JSON using Structured Outputs.

src/ai/sentiment.schema.ts
import { z } from "zod"

export const SentimentResultSchema = z.object({
language: z.string().min(2).max(12).optional(),
label: z.enum(["VERY_NEGATIVE", "NEGATIVE", "NEUTRAL", "POSITIVE", "VERY_POSITIVE"]),
score: z.number().min(-1).max(1),
intensity: z.number().min(0).max(1),
urgency: z.number().int().min(0).max(100),
topics: z.array(z.string().min(1).max(64)).max(10),
keyPhrases: z.array(z.string().min(1).max(64)).max(10),
summary: z.string().min(1).max(400)
})

export type SentimentResult = z.infer<typeof SentimentResultSchema>

7. Moderation check

Moderation endpoint models and usage.

src/ai/moderation.ts
import { openai } from "@/src/lib/openai"

export async function moderateText(input: string) {
const model = process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest"

const res = await openai.moderations.create({
model,
input
})

const result = res.results?.[0]
const flagged = Boolean(result?.flagged)

return {
flagged,
raw: res
}
}

8. Sentiment inference using Responses API

Responses API reference.

src/ai/sentiment.ts
import { openai } from "@/src/lib/openai"
import { SentimentResultSchema } from "@/src/ai/sentiment.schema"

export async function inferSentiment(text: string) {
const model = process.env.OPENAI_SENTIMENT_MODEL || process.env.OPENAI_MODEL || "gpt-5.2"

const instructions = [
"You are a sentiment and complaint triage classifier for a consumer dispute platform.",
"Return only JSON that matches the schema exactly.",
"Be conservative. Do not invent facts.",
"Topics must be short nouns like billing, delivery, service, fraud, cancellation, claim, refund, support, policy, outage, store, staff."
].join("\n")

const schema = {
name: "sentiment_result",
schema: {
type: "object",
additionalProperties: false,
properties: {
language: { type: "string" },
label: { type: "string", enum: ["VERY_NEGATIVE","NEGATIVE","NEUTRAL","POSITIVE","VERY_POSITIVE"] },
score: { type: "number", minimum: -1, maximum: 1 },
intensity: { type: "number", minimum: 0, maximum: 1 },
urgency: { type: "integer", minimum: 0, maximum: 100 },
topics: { type: "array", items: { type: "string" }, maxItems: 10 },
keyPhrases: { type: "array", items: { type: "string" }, maxItems: 10 },
summary: { type: "string", minLength: 1, maxLength: 400 }
},
required: ["label","score","intensity","urgency","topics","keyPhrases","summary"]
}
} as const

const resp = await openai.responses.create({
model,
instructions,
input: [
{
role: "user",
content: [
{ type: "input_text", text }
]
}
],
response_format: {
type: "json_schema",
json_schema: schema
}
})

const outputText = resp.output_text
const parsed = JSON.parse(outputText)
return {
data: SentimentResultSchema.parse(parsed),
raw: resp,
model
}
}

Structured Outputs guide.

9. Hashing utility for dedupe
   src/utils/hash.ts
   import crypto from "crypto"

export function sha256(input: string) {
return crypto.createHash("sha256").update(input, "utf8").digest("hex")
}

10. Sentiment pipeline service

Creates events, updates complaint snapshot, updates daily aggregate.

src/services/sentimentPipeline.service.ts
import { prisma } from "@/src/lib/prisma"
import { sha256 } from "@/src/utils/hash"
import { moderateText } from "@/src/ai/moderation"
import { inferSentiment } from "@/src/ai/sentiment"

type IngestArgs = {
brandId: string
complaintId?: string | null
sourceType: "COMPLAINT" | "BRAND_RESPONSE" | "CONSUMER_MESSAGE" | "SYSTEM_NOTE"
sourceId?: string | null
text: string
languageHint?: string | null
}

function startOfDayUtc(d: Date) {
const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0))
return x
}

function pct(part: number, total: number) {
if (total <= 0) return 0
return Number((part / total).toFixed(4))
}

export async function ingestSentiment(args: IngestArgs) {
const normalized = args.text.trim()
const textHash = sha256(normalized)

const existing = await prisma.sentimentEvent.findFirst({
where: {
brandId: args.brandId,
complaintId: args.complaintId ?? null,
sourceType: args.sourceType,
sourceId: args.sourceId ?? null,
textHash
}
})
if (existing) return existing

const moderation = await moderateText(normalized)
const sentiment = await inferSentiment(normalized)

const created = await prisma.sentimentEvent.create({
data: {
brandId: args.brandId,
complaintId: args.complaintId ?? null,
sourceType: args.sourceType,
sourceId: args.sourceId ?? null,
textHash,
language: sentiment.data.language ?? args.languageHint ?? null,
label: sentiment.data.label,
score: sentiment.data.score,
intensity: sentiment.data.intensity,
urgency: sentiment.data.urgency,
topics: sentiment.data.topics,
keyPhrases: sentiment.data.keyPhrases,
model: sentiment.model,
provider: "openai",
moderationFlagged: moderation.flagged,
moderationRaw: moderation.raw as any,
raw: sentiment.raw as any
}
})

if (args.complaintId) {
await prisma.complaintSentimentSnapshot.upsert({
where: { complaintId: args.complaintId },
create: {
complaintId: args.complaintId,
brandId: args.brandId,
lastEventAt: created.createdAt,
currentLabel: created.label,
currentScore: created.score,
currentUrgency: created.urgency,
topics: created.topics
},
update: {
lastEventAt: created.createdAt,
currentLabel: created.label,
currentScore: created.score,
currentUrgency: created.urgency,
topics: created.topics
}
})
}

const day = startOfDayUtc(created.createdAt)

const dayEvents = await prisma.sentimentEvent.findMany({
where: { brandId: args.brandId, createdAt: { gte: day, lt: new Date(day.getTime() + 86400000) } },
select: { score: true, urgency: true, label: true, topics: true }
})

const total = dayEvents.length
const avgScore = total ? dayEvents.reduce((a, e) => a + e.score, 0) / total : 0
const avgUrgency = total ? dayEvents.reduce((a, e) => a + e.urgency, 0) / total : 0

const positive = dayEvents.filter(e => e.label === "POSITIVE" || e.label === "VERY_POSITIVE").length
const negative = dayEvents.filter(e => e.label === "NEGATIVE" || e.label === "VERY_NEGATIVE").length
const neutral = dayEvents.filter(e => e.label === "NEUTRAL").length

const topicCounts = new Map<string, number>()
for (const e of dayEvents) {
for (const t of e.topics ?? []) {
topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1)
}
}
const topTopics = [...topicCounts.entries()]
.sort((a, b) => b[1] - a[1])
.slice(0, 8)
.map(([t]) => t)

await prisma.brandSentimentDaily.upsert({
where: { brandId_day: { brandId: args.brandId, day } },
create: {
brandId: args.brandId,
day,
count: total,
avgScore,
avgUrgency,
positivePct: pct(positive, total),
negativePct: pct(negative, total),
neutralPct: pct(neutral, total),
topTopics
},
update: {
count: total,
avgScore,
avgUrgency,
positivePct: pct(positive, total),
negativePct: pct(negative, total),
neutralPct: pct(neutral, total),
topTopics
}
})

return created
}

11. Async processing with BullMQ

We process sentiment off the request path.

src/queues/sentiment.queue.ts
import { Queue } from "bullmq"
import IORedis from "ioredis"

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379")
export const sentimentQueue = new Queue("sentimentQueue", { connection })
export const sentimentQueueConnection = connection

src/workers/sentiment.worker.ts
import { Worker } from "bullmq"
import { sentimentQueueConnection } from "@/src/queues/sentiment.queue"
import { ingestSentiment } from "@/src/services/sentimentPipeline.service"

export const sentimentWorker = new Worker(
"sentimentQueue",
async (job) => {
const payload = job.data as any
await ingestSentiment(payload)
},
{ connection: sentimentQueueConnection }
)

Run worker:

node -r ts-node/register src/workers/sentiment.worker.ts

12. Hook sentiment into lifecycle
    Complaint created hook

In your complaint creation service, after DB insert and brand routing:

import { sentimentQueue } from "@/src/queues/sentiment.queue"

await sentimentQueue.add("complaint-sentiment", {
brandId: complaint.brandId,
complaintId: complaint.id,
sourceType: "COMPLAINT",
sourceId: complaint.id,
text: `${complaint.title ?? ""}\n\n${complaint.description ?? ""}`.trim()
})

Brand response created hook
await sentimentQueue.add("brand-response-sentiment", {
brandId: complaint.brandId,
complaintId: complaint.id,
sourceType: "BRAND_RESPONSE",
sourceId: response.id,
text: response.body
})

Consumer message hook
await sentimentQueue.add("consumer-message-sentiment", {
brandId: complaint.brandId,
complaintId: complaint.id,
sourceType: "CONSUMER_MESSAGE",
sourceId: msg.id,
text: msg.body
})

13. API endpoints for dashboards
    Brand daily trend

src/app/api/brand/sentiment/daily/route.ts

import { prisma } from "@/src/lib/prisma"
import { requireBrandUser } from "@/src/server/auth/requireBrandUser"

export async function GET(req: Request) {
const session = await requireBrandUser()
const brandId = session.brandId
const { searchParams } = new URL(req.url)

const days = Math.min(Number(searchParams.get("days") || "30"), 180)
const since = new Date(Date.now() - days \* 86400000)

const rows = await prisma.brandSentimentDaily.findMany({
where: { brandId, day: { gte: since } },
orderBy: { day: "asc" }
})

return Response.json({ rows })
}

Latest events

src/app/api/brand/sentiment/events/route.ts

import { prisma } from "@/src/lib/prisma"
import { requireBrandUser } from "@/src/server/auth/requireBrandUser"

export async function GET(req: Request) {
const session = await requireBrandUser()
const brandId = session.brandId
const { searchParams } = new URL(req.url)

const take = Math.min(Number(searchParams.get("take") || "50"), 200)

const items = await prisma.sentimentEvent.findMany({
where: { brandId },
orderBy: { createdAt: "desc" },
take
})

return Response.json({ items })
}

Complaint sentiment snapshot

src/app/api/brand/complaints/[id]/sentiment/route.ts

import { prisma } from "@/src/lib/prisma"
import { requireBrandUser } from "@/src/server/auth/requireBrandUser"

export async function GET(\_: Request, ctx: { params: { id: string } }) {
const session = await requireBrandUser()
const brandId = session.brandId

const snap = await prisma.complaintSentimentSnapshot.findFirst({
where: { complaintId: ctx.params.id, brandId }
})

return Response.json({ snapshot: snap })
}

14. Paid alerts tie-in

Real-time email alerts are a paid feature. You already gated email alerts. Keep sentiment analysis available for dashboards. Gate email alerts that trigger from sentiment spikes.

Add a trigger function in your daily upsert step:

If negativePct spikes or avgUrgency crosses threshold. Create an in-app notification always. Queue email only if the paid gate allows.

Use your existing feature gate from Sprint 19–20.

15. Tests
    src/tests/sentiment.pipeline.test.ts
    import { ingestSentiment } from "@/src/services/sentimentPipeline.service"
    import { prisma } from "@/src/lib/prisma"

jest.mock("@/src/ai/moderation", () => ({
moderateText: async () => ({ flagged: false, raw: { mocked: true } })
}))

jest.mock("@/src/ai/sentiment", () => ({
inferSentiment: async () => ({
model: "mock-model",
raw: { mocked: true },
data: {
language: "en",
label: "NEGATIVE",
score: -0.6,
intensity: 0.8,
urgency: 85,
topics: ["billing"],
keyPhrases: ["refund not processed"],
summary: "Customer is upset about billing and a delayed refund."
}
})
}))

describe("Sentiment pipeline", () => {
it("creates event and updates daily aggregate and complaint snapshot", async () => {
const brandId = "brand_test"
const complaintId = "complaint_test"

    await ingestSentiment({
      brandId,
      complaintId,
      sourceType: "COMPLAINT",
      sourceId: complaintId,
      text: "I am very unhappy. Refund not processed."
    })

    const events = await prisma.sentimentEvent.findMany({ where: { brandId } })
    expect(events.length).toBe(1)

    const snap = await prisma.complaintSentimentSnapshot.findUnique({ where: { complaintId } })
    expect(snap?.currentUrgency).toBe(85)

    const daily = await prisma.brandSentimentDaily.findFirst({ where: { brandId } })
    expect(daily?.count).toBe(1)
    expect(daily?.negativePct).toBeGreaterThan(0)

})
})

16. Production notes

Use a worker for sentiment. Never block complaint creation.

Store raw model output for audit.

Use moderation to reduce risk. Moderation is free to use and recommended for harmful content filtering.

Use Structured Outputs to guarantee valid JSON.

Data controls exist for OpenAI API usage.

Sprint 29 completion criteria

SentimentEvent created for complaint creation and messages.

ComplaintSentimentSnapshot always reflects latest event.

BrandSentimentDaily aggregates correctly for dashboards.

Dashboards can query daily trend and latest events.

Worker handles processing reliably.

Tests validate pipeline integrity.
