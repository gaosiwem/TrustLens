import { prisma } from "../../lib/prisma.js";
import { startOfDay, endOfDay } from "date-fns";

export interface AuditData {
  brandDetails: {
    name: string;
    logo?: string;
    description?: string;
    isVerified: boolean;
  };
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalComplaints: number;
    resolvedCount: number;
    resolutionRate: number;
    avgSentimentScore: number;
    avgResponseTimeHours: number;
  };
  statusDistribution: { status: string; count: number }[];
  recentTrends: { date: string; count: number }[];
}

export class AuditService {
  static async generateAuditData(
    brandId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AuditData> {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) throw new Error(`Brand not found: ${brandId}`);

    // 1. Fetch Complaints in Range
    // Removing 'category' include as it doesn't exist on Complaint model
    const complaints = await prisma.complaint.findMany({
      where: {
        brandId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalComplaints = complaints.length;
    const resolvedCount = complaints.filter(
      (c) => c.status === "RESOLVED",
    ).length;
    const resolutionRate =
      totalComplaints > 0 ? (resolvedCount / totalComplaints) * 100 : 0;

    // 2. Sentiment Analysis
    const complaintsWithSentiment = complaints.filter(
      (c) => c.sentimentScore !== null,
    );
    const avgSentimentScore =
      complaintsWithSentiment.length > 0
        ? complaintsWithSentiment.reduce(
            (sum, c) => sum + (c.sentimentScore || 0),
            0,
          ) / complaintsWithSentiment.length
        : 0;

    // 3. Response Time (Approximate)
    const respondedComplaints = complaints.filter((c) =>
      ["RESOLVED", "RESPONDED", "INFO_PROVIDED"].includes(c.status),
    );
    let totalResponseTimeMs = 0;
    respondedComplaints.forEach((c) => {
      totalResponseTimeMs += c.updatedAt.getTime() - c.createdAt.getTime();
    });
    const avgResponseTimeHours =
      respondedComplaints.length > 0
        ? totalResponseTimeMs / respondedComplaints.length / (1000 * 60 * 60)
        : 0;

    // 4. Status Distribution (Replacing Categories)
    const statusMap = new Map<string, number>();
    complaints.forEach((c) => {
      statusMap.set(c.status, (statusMap.get(c.status) || 0) + 1);
    });
    const statusDistribution = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    // 5. Recent Trends (Daily Volume)
    const trendsMap = new Map<string, number>();
    complaints.forEach((c) => {
      const day = c.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      trendsMap.set(day, (trendsMap.get(day) || 0) + 1);
    });

    const recentTrends = Array.from(trendsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      brandDetails: {
        name: brand.name,
        logo: brand.logoUrl || undefined, // Map logoUrl to logo
        description: brand.description || undefined,
        isVerified: brand.isVerified,
      },
      period: {
        start: startDate,
        end: endDate,
      },
      metrics: {
        totalComplaints,
        resolvedCount,
        resolutionRate,
        avgSentimentScore,
        avgResponseTimeHours,
      },
      statusDistribution,
      recentTrends,
    };
  }
}
