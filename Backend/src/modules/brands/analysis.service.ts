import { prisma } from "../../lib/prisma.js";
import { OpenAIProvider } from "../ai/openai.provider.js";

const ai = new OpenAIProvider();

export async function getRootCauseAnalysis(brandId: string) {
  // 1. Get recent sentiment events with topics
  const recentEvents = await prisma.sentimentEvent.findMany({
    where: {
      brandId,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      topics: { isEmpty: false },
    },
    take: 100,
  });

  // 2. Cluster by top 3 topics
  const topicFrequency: Record<string, string[]> = {};
  recentEvents.forEach((event) => {
    event.topics.forEach((t) => {
      if (!topicFrequency[t]) topicFrequency[t] = [];
      // Combine some text for context
      topicFrequency[t].push(`[${event.label}] Topic: ${t}`);
    });
  });

  const sortedTopics = Object.entries(topicFrequency)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3); // Top 3 systemic issues

  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { name: true },
  });

  // 3. Perform AI analysis for each top topic
  const insights = await Promise.all(
    sortedTopics.map(async ([topic, contexts]) => {
      const contextStr = contexts.join("\n").slice(0, 2000); // Limit context size
      const analysis = await ai.analyzeRootCause(
        brand?.name || "the brand",
        topic,
        contextStr,
      );

      return {
        topic,
        volume: contexts.length,
        ...analysis,
      };
    }),
  );

  return insights.filter((i) => i.cause); // Filter out failed analyses
}

export async function getCompetitorVulnerabilities(brandId: string) {
  // 1. Identify competitors (All other brands)
  // In a real scenario, this would filter by category/industry
  const competitors = await prisma.brand.findMany({
    where: {
      id: { not: brandId },
    },
    select: { id: true, name: true },
  });

  if (competitors.length === 0) return [];

  const vulnerabilities = [];

  // 2. Analyze each competitor for weaknesses
  for (const competitor of competitors) {
    // Fetch recent NEGATIVE events
    const negativeEvents = await prisma.sentimentEvent.findMany({
      where: {
        brandId: competitor.id,
        label: { in: ["NEGATIVE", "VERY_NEGATIVE"] },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        topics: { isEmpty: false },
      },
      take: 50, // Sample size
    });

    if (negativeEvents.length < 3) continue; // Not enough data to be a "Pattern"

    // Cluster by top topic
    const topicFrequency: Record<string, number> = {};
    negativeEvents.forEach((e) => {
      e.topics.forEach((t) => {
        topicFrequency[t] = (topicFrequency[t] || 0) + 1;
      });
    });

    // Get the #1 weakness
    const topWeakness = Object.entries(topicFrequency).sort(
      (a, b) => b[1] - a[1],
    )[0];

    if (topWeakness) {
      vulnerabilities.push({
        competitorName: competitor.name,
        weakness: topWeakness[0],
        volume: topWeakness[1],
        opportunity: generateOpportunity(topWeakness[0]),
      });
    }
  }

  // 3. Rank by Volume (Biggest Market Gaps First)
  return vulnerabilities.sort((a, b) => b.volume - a.volume).slice(0, 5);
}

function generateOpportunity(weakness: string): string {
  const lower = weakness.toLowerCase();
  if (lower.includes("price") || lower.includes("expensive"))
    return "Launch a price-match campaign.";
  if (lower.includes("service") || lower.includes("rude"))
    return "Highlight your 5-star support team.";
  if (lower.includes("quality") || lower.includes("broken"))
    return "Emphasize your 2-year warranty.";
  if (lower.includes("queue") || lower.includes("wait"))
    return "Promote your fast checkout/delivery.";
  if (lower.includes("stock") || lower.includes("available"))
    return "Advertise your 'In Stock' guarantee.";
  return "differentiation campaign.";
}
