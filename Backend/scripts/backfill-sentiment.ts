import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
config();

const prisma = new PrismaClient();

// Import the sentiment pipeline directly
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function inferSentiment(text: string) {
  const model = process.env.OPENAI_SENTIMENT_MODEL || "gpt-4o";

  const instructions = [
    "You are a sentiment and complaint triage classifier for a consumer dispute platform.",
    "Return only JSON that matches the schema exactly.",
    "Be conservative. Do not invent facts.",
    "Topics must be short nouns like billing, delivery, service, fraud, cancellation, claim, refund, support, policy, outage, store, staff.",
  ].join("\n");

  const resp = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: instructions },
      { role: "user", content: text },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "sentiment_result",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            language: { type: "string" },
            label: {
              type: "string",
              enum: [
                "VERY_NEGATIVE",
                "NEGATIVE",
                "NEUTRAL",
                "POSITIVE",
                "VERY_POSITIVE",
              ],
            },
            score: { type: "number" },
            intensity: { type: "number" },
            urgency: { type: "integer" },
            topics: { type: "array", items: { type: "string" } },
            keyPhrases: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
          },
          required: [
            "language",
            "label",
            "score",
            "intensity",
            "urgency",
            "topics",
            "keyPhrases",
            "summary",
          ],
        },
      },
    },
  });

  const outputText = resp.choices[0].message.content;
  if (!outputText) throw new Error("No output from OpenAI");

  return JSON.parse(outputText);
}

import * as crypto from "crypto";

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function startOfDayUtc(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0),
  );
}

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Number((part / total).toFixed(4));
}

async function backfillSentiment() {
  console.log("🔍 Fetching complaints without sentiment analysis...\n");

  // Get all existing sentiment event complaint IDs
  const existingEvents = await prisma.sentimentEvent.findMany({
    where: { complaintId: { not: null } },
    select: { complaintId: true },
  });
  const analyzedComplaintIds = new Set(
    existingEvents.map((e) => e.complaintId),
  );

  // Find complaints that don't have sentiment events yet
  const allComplaints = await prisma.complaint.findMany({
    include: { brand: true },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  const complaints = allComplaints.filter(
    (c) => !analyzedComplaintIds.has(c.id),
  );

  console.log(`Found ${complaints.length} complaints to analyze.\n`);

  for (const complaint of complaints) {
    const text =
      `${complaint.title || ""}\n\n${complaint.description || ""}`.trim();
    if (!text) {
      console.log(`⏭️  Skipping ${complaint.id} - no text`);
      continue;
    }

    console.log(`🧠 Analyzing: "${complaint.title?.slice(0, 50)}..."`);

    try {
      const sentiment = await inferSentiment(text);
      const textHash = sha256(text);

      // Create sentiment event
      const event = await prisma.sentimentEvent.create({
        data: {
          brandId: complaint.brandId,
          complaintId: complaint.id,
          sourceType: "COMPLAINT",
          sourceId: complaint.id,
          textHash,
          language: sentiment.language || "en",
          label: sentiment.label,
          score: sentiment.score,
          intensity: sentiment.intensity,
          urgency: sentiment.urgency,
          topics: sentiment.topics,
          keyPhrases: sentiment.keyPhrases,
          model: "gpt-4o",
          provider: "openai",
          moderationFlagged: false,
          raw: sentiment as any,
        },
      });

      console.log(
        `   ✅ ${sentiment.label} (score: ${sentiment.score.toFixed(2)}, urgency: ${sentiment.urgency}%)`,
      );
      console.log(`   Topics: ${sentiment.topics.join(", ")}`);

      // Update daily aggregation
      const day = startOfDayUtc(event.createdAt);
      const dayEvents = await prisma.sentimentEvent.findMany({
        where: {
          brandId: complaint.brandId,
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
        where: { brandId_day: { brandId: complaint.brandId, day } },
        create: {
          brandId: complaint.brandId,
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

      console.log("");
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  const finalEventCount = await prisma.sentimentEvent.count();
  const finalDailyCount = await prisma.brandSentimentDaily.count();

  console.log("\n📊 Final counts:");
  console.log(`   SentimentEvent: ${finalEventCount}`);
  console.log(`   BrandSentimentDaily: ${finalDailyCount}`);
}

backfillSentiment()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
