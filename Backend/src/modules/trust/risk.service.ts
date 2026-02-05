import { prisma } from "../../lib/prisma.js";
import { SentimentSourceType } from "@prisma/client";

export interface RiskSignal {
  id: string;
  type: "VIRAL_POTENTIAL" | "PATTERN_FAILURE" | "INFLUENCER_DISCONTENT";
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  momentum: number; // 0-100
  description: string;
  count: number;
}

export async function getRiskSignals(brandId: string): Promise<RiskSignal[]> {
  // 1. Fetch recent high-urgency/negative sentiment events
  const recentEvents = await prisma.sentimentEvent.findMany({
    where: {
      brandId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
    },
    orderBy: { createdAt: "desc" },
  });

  const criticalComplaints = recentEvents.filter(
    (e) => e.urgency > 70 && e.score < -0.4,
  );

  const signals: RiskSignal[] = [];

  // A. Viral Potential Signal
  if (criticalComplaints.length > 0) {
    const avgUrgency =
      criticalComplaints.reduce((acc, curr) => acc + curr.urgency, 0) /
      criticalComplaints.length;
    const momentum = Math.min(
      100,
      Math.round(avgUrgency * (1 + criticalComplaints.length * 0.1)),
    );

    signals.push({
      id: "viral-1",
      type: "VIRAL_POTENTIAL",
      title: "Elevated Viral Potential",
      severity: momentum > 80 ? "CRITICAL" : "HIGH",
      momentum,
      count: criticalComplaints.length,
      description: `Detected ${criticalComplaints.length} high-urgency complaints with significant negative sentiment that could escalate rapidly.`,
    });
  }

  // B. Pattern Failure Signal (Specific topics mentioned multiple times)
  const topicCounts: Record<string, number> = {};
  recentEvents.forEach((e) => {
    e.topics.forEach((t) => {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
  });

  const repeatedTopics = Object.entries(topicCounts)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1]);

  if (repeatedTopics.length > 0) {
    const firstTopic = repeatedTopics[0];
    if (firstTopic) {
      const topTopic = firstTopic[0];
      const topCount = firstTopic[1];
      signals.push({
        id: "pattern-1",
        type: "PATTERN_FAILURE",
        title: `Systemic Issue: ${topTopic.charAt(0).toUpperCase() + topTopic.slice(1)}`,
        severity: "MEDIUM",
        momentum: 45,
        count: topCount,
        description: `Repetitive mentions of "${topTopic}" detected in recent feedback indicate a recurring service pattern failure.`,
      });
    }
  }

  // If no signals, return a stable baseline
  if (signals.length === 0) {
    signals.push({
      id: "baseline-1",
      type: "VIRAL_POTENTIAL",
      title: "Brand Perception Stable",
      severity: "LOW",
      momentum: 12,
      count: 0,
      description:
        "No significant threat vectors or negative viral signals detected in the last 7 days.",
    });
  }

  return signals;
}
