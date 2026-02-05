import { prisma } from "../../lib/prisma.js";
import { subMonths, subDays, startOfMonth, endOfMonth, format } from "date-fns";

export interface BenchmarkingData {
  current: {
    resolutionRate: number;
    avgSentiment: number;
    avgResponseTime: number;
  };
  peak: {
    resolutionRate: number;
    avgSentiment: number;
    avgResponseTime: number; // Lowest is peak for response time
    peakDate: string;
  };
  industry: {
    avgResolutionRate: number;
    avgSentiment: number;
    avgResponseTime: number;
    brandCount: number;
  };
  history: {
    month: string;
    resolutionRate: number;
    industryAvg: number;
  }[];
}

export class BenchmarkingService {
  static async getBenchmarkingData(brandId: string): Promise<BenchmarkingData> {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) throw new Error("Brand not found");

    const category = (brand as any).category || "General";
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // 1. Current Metrics (Last 30 Days)
    const currentMetrics = await this.calculateMetrics(
      brandId,
      thirtyDaysAgo,
      now,
    );

    // 2. Historical Peaks (Check last 12 months, month-by-month)
    let peakRes = 0;
    let peakSent = -1;
    let peakResponse = 9999;
    let peakMonth = "";

    for (let i = 0; i < 12; i++) {
      const monthStart = startOfMonth(subDays(now, i * 30));
      const monthEnd = endOfMonth(monthStart);
      const m = await this.calculateMetrics(brandId, monthStart, monthEnd);

      if (m.resolutionRate >= peakRes) {
        peakRes = m.resolutionRate;
        peakMonth = format(monthStart, "MMM yyyy");
      }
      if (m.avgSentiment > peakSent) peakSent = m.avgSentiment;
      if (m.avgResponseTime > 0 && m.avgResponseTime < peakResponse)
        peakResponse = m.avgResponseTime;
    }

    // 3. Industry Averages ( brands in same category)
    const categoryBrands = await prisma.brand.findMany({
      where: { category, id: { not: brandId } },
      select: { id: true },
    });

    let totalRes = 0;
    let totalSent = 0;
    let totalResp = 0;
    let count = 0;

    for (const b of categoryBrands) {
      const m = await this.calculateMetrics(b.id, thirtyDaysAgo, now);
      if (m.totalComplaints > 0) {
        totalRes += m.resolutionRate;
        totalSent += m.avgSentiment;
        totalResp += m.avgResponseTime;
        count++;
      }
    }

    // 4. Full 12-Month History (for charts)
    const history = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(monthStart);

      const m = await this.calculateMetrics(brandId, monthStart, monthEnd);

      // Industry average for this month
      let monthTotalRes = 0;
      let monthCount = 0;
      for (const b of categoryBrands) {
        const indM = await this.calculateMetrics(b.id, monthStart, monthEnd);
        if (indM.totalComplaints > 0) {
          monthTotalRes += indM.resolutionRate;
          monthCount++;
        }
      }

      history.push({
        month: format(monthStart, "MMM"),
        resolutionRate: m.resolutionRate,
        industryAvg: monthCount > 0 ? monthTotalRes / monthCount : 0,
      });
    }

    return {
      current: currentMetrics,
      peak: {
        resolutionRate: peakRes,
        avgSentiment: peakSent,
        avgResponseTime: peakResponse === 9999 ? 0 : peakResponse,
        peakDate: peakMonth,
      },
      industry: {
        avgResolutionRate: count > 0 ? totalRes / count : 0,
        avgSentiment: count > 0 ? totalSent / count : 0,
        avgResponseTime: count > 0 ? totalResp / count : 0,
        brandCount: count,
      },
      history,
    };
  }

  private static async calculateMetrics(
    brandId: string,
    start: Date,
    end: Date,
  ) {
    const complaints = await prisma.complaint.findMany({
      where: {
        brandId,
        createdAt: { gte: start, lte: end },
      },
    });

    const total = complaints.length;
    if (total === 0) {
      return {
        resolutionRate: 0,
        avgSentiment: 0,
        avgResponseTime: 0,
        totalComplaints: 0,
      };
    }

    const resolved = complaints.filter((c) => c.status === "RESOLVED").length;
    const sentiment = complaints.filter((c) => c.sentimentScore !== null);
    const avgSent =
      sentiment.length > 0
        ? sentiment.reduce((sum, c) => sum + (c.sentimentScore || 0), 0) /
          sentiment.length
        : 0;

    const responded = complaints.filter((c) =>
      ["RESOLVED", "RESPONDED", "INFO_PROVIDED"].includes(c.status),
    );
    let totalRespTime = 0;
    responded.forEach((c) => {
      totalRespTime += c.updatedAt.getTime() - c.createdAt.getTime();
    });
    const avgResp =
      responded.length > 0
        ? totalRespTime / responded.length / (1000 * 60 * 60)
        : 0;

    return {
      resolutionRate: (resolved / total) * 100,
      avgSentiment: avgSent,
      avgResponseTime: avgResp,
      totalComplaints: total,
    };
  }
}
