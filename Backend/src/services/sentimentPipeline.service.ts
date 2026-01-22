import { prisma } from "../lib/prisma.js";
import { sha256 } from "../utils/hash.js";
import { moderateText } from "../ai/moderation.js";
import { inferSentiment } from "../ai/sentiment.js";

type IngestArgs = {
  brandId: string;
  complaintId?: string | null;
  sourceType:
    | "COMPLAINT"
    | "BRAND_RESPONSE"
    | "CONSUMER_MESSAGE"
    | "SYSTEM_NOTE";
  sourceId?: string | null;
  text: string;
  languageHint?: string | null;
};

function startOfDayUtc(d: Date) {
  const x = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0),
  );
  return x;
}

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Number((part / total).toFixed(4));
}

export async function ingestSentiment(args: IngestArgs) {
  const normalized = args.text.trim();
  const textHash = sha256(normalized);

  const existing = await prisma.sentimentEvent.findFirst({
    where: {
      brandId: args.brandId,
      complaintId: args.complaintId ?? null,
      sourceType: args.sourceType,
      sourceId: args.sourceId ?? null,
      textHash,
    },
  });
  if (existing) return existing;

  const moderation = await moderateText(normalized);
  const sentiment = await inferSentiment(normalized);

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
      raw: sentiment.raw as any,
    },
  });

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
        topics: created.topics,
      },
      update: {
        lastEventAt: created.createdAt,
        currentLabel: created.label,
        currentScore: created.score,
        currentUrgency: created.urgency,
        topics: created.topics,
      },
    });
  }

  const day = startOfDayUtc(created.createdAt);

  const dayEvents = await prisma.sentimentEvent.findMany({
    where: {
      brandId: args.brandId,
      createdAt: { gte: day, lt: new Date(day.getTime() + 86400000) },
    },
    select: { score: true, urgency: true, label: true, topics: true },
  });

  const total = dayEvents.length;
  const avgScore = total
    ? dayEvents.reduce((a, e) => a + e.score, 0) / total
    : 0;
  const avgUrgency = total
    ? dayEvents.reduce((a, e) => a + e.urgency, 0) / total
    : 0;

  const positive = dayEvents.filter(
    (e) => e.label === "POSITIVE" || e.label === "VERY_POSITIVE",
  ).length;
  const negative = dayEvents.filter(
    (e) => e.label === "NEGATIVE" || e.label === "VERY_NEGATIVE",
  ).length;
  const neutral = dayEvents.filter((e) => e.label === "NEUTRAL").length;

  const topicCounts = new Map<string, number>();
  for (const e of dayEvents) {
    for (const t of e.topics ?? []) {
      topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
    }
  }
  const topTopics = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([t]) => t);

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
      topTopics,
    },
    update: {
      count: total,
      avgScore,
      avgUrgency,
      positivePct: pct(positive, total),
      negativePct: pct(negative, total),
      neutralPct: pct(neutral, total),
      topTopics,
    },
  });

  return created;
}
