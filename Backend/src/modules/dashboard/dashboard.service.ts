import prisma from "../../lib/prisma.js";

export async function getDashboardMetrics(userId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Helper to get count for a period
  const getCount = async (whereClause: any, from?: Date, to?: Date) => {
    const where = { ...whereClause };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lt = to;
    }
    return prisma.complaint.count({ where });
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const commonWhere = { userId };

  // Total Complaints
  const totalComplaints = await getCount(commonWhere);
  const totalCurrent = await getCount(commonWhere, thirtyDaysAgo);
  const totalPrevious = await getCount(
    commonWhere,
    sixtyDaysAgo,
    thirtyDaysAgo,
  );
  const totalComplaintsTrend = calculateTrend(totalCurrent, totalPrevious);

  // Resolved
  const resolvedWhere = { ...commonWhere, status: "RESOLVED" };
  const resolved = await getCount(resolvedWhere);
  const resolvedCurrent = await getCount(resolvedWhere, thirtyDaysAgo);
  const resolvedPrevious = await getCount(
    resolvedWhere,
    sixtyDaysAgo,
    thirtyDaysAgo,
  );
  const resolvedTrend = calculateTrend(resolvedCurrent, resolvedPrevious);

  // Pending
  const pendingStatuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "RESPONDED"];
  const pendingWhere = { ...commonWhere, status: { in: pendingStatuses } };
  const pending = await getCount(pendingWhere);
  const pendingCurrent = await getCount(pendingWhere, thirtyDaysAgo);
  const pendingPrevious = await getCount(
    pendingWhere,
    sixtyDaysAgo,
    thirtyDaysAgo,
  );
  const pendingTrend = calculateTrend(pendingCurrent, pendingPrevious);

  // Needs Info
  const needsInfoWhere = { ...commonWhere, status: "NEEDS_INFO" };
  const needsInfo = await getCount(needsInfoWhere);
  const needsInfoCurrent = await getCount(needsInfoWhere, thirtyDaysAgo);
  const needsInfoPrevious = await getCount(
    needsInfoWhere,
    sixtyDaysAgo,
    thirtyDaysAgo,
  );
  const needsInfoTrend = calculateTrend(needsInfoCurrent, needsInfoPrevious);

  const rejected = await prisma.complaint.count({
    where: { userId, status: "REJECTED" },
  });

  return {
    totalComplaints,
    totalComplaintsTrend,
    resolved,
    resolvedTrend,
    pending,
    pendingTrend,
    needsInfo,
    needsInfoTrend,
    rejected,
  };
}

export async function getComplaintTrends(userId: string) {
  // Get complaints grouped by month for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const complaints = await prisma.complaint.findMany({
    where: {
      userId,
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by month
  const monthlyData = new Map<string, number>();
  complaints.forEach((complaint) => {
    const month = complaint.createdAt.toISOString().substring(0, 7); // YYYY-MM
    monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
  });

  return Array.from(monthlyData.entries()).map(([month, count]) => ({
    month,
    count,
  }));
}

export async function getStatusDistribution(userId: string) {
  const statuses = await prisma.complaint.groupBy({
    by: ["status"],
    where: { userId },
    _count: { status: true },
  });

  return statuses.map((s) => ({
    status: s.status,
    count: s._count.status,
  }));
}

export async function getAIInsights(userId: string) {
  // Get all brands the user has complained about
  const userComplaints = await prisma.complaint.findMany({
    where: { userId },
    select: { brandId: true },
    distinct: ["brandId"],
  });

  const brandIds = userComplaints
    .map((c) => c.brandId)
    .filter((id): id is string => id !== null);

  // Get performance for these brands
  const brandPerformance = await Promise.all(
    brandIds.map(async (brandId) => {
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        select: { name: true, logoUrl: true },
      });

      const totalBrandComplaints = await prisma.complaint.count({
        where: { brandId },
      });
      const resolvedBrandComplaints = await prisma.complaint.count({
        where: { brandId, status: "RESOLVED" },
      });

      const resolutionRate =
        totalBrandComplaints > 0
          ? Math.round((resolvedBrandComplaints / totalBrandComplaints) * 100)
          : 0;

      return {
        brandName: brand?.name || "Unknown",
        logoUrl: brand?.logoUrl,
        resolutionRate,
        totalComplaints: totalBrandComplaints,
      };
    }),
  );

  // Platform wide metrics
  const totalPlatformComplaints = await prisma.complaint.count();
  const resolvedPlatformComplaints = await prisma.complaint.count({
    where: { status: "RESOLVED" },
  });
  const platformResolutionRate =
    totalPlatformComplaints > 0
      ? Math.round((resolvedPlatformComplaints / totalPlatformComplaints) * 100)
      : 0;

  // Personal metrics
  const totalUserComplaints = await prisma.complaint.count({
    where: { userId },
  });
  const resolvedUserComplaints = await prisma.complaint.count({
    where: { userId, status: "RESOLVED" },
  });
  const userResolutionRate =
    totalUserComplaints > 0
      ? Math.round((resolvedUserComplaints / totalUserComplaints) * 100)
      : 0;

  // Top Issue (Common brand)
  const brandCounts = await prisma.complaint.groupBy({
    by: ["brandId"],
    where: { userId },
    _count: { brandId: true },
    orderBy: { _count: { brandId: "desc" } },
    take: 1,
  });

  let topIssue = "building your history";
  let resolutionSuggestion = "";

  if (totalUserComplaints === 0) {
    topIssue = "getting started";
    resolutionSuggestion = "Start building your Trust Score details";
  } else if (totalUserComplaints < 5) {
    if (brandCounts.length > 0 && brandCounts[0].brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: brandCounts[0].brandId },
      });
      if (brand) topIssue = brand.name;
    }
    resolutionSuggestion = "Detailed complaints resolve 2x faster";
  } else {
    // Standard Logic for established users
    if (brandCounts.length > 0 && brandCounts[0].brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: brandCounts[0].brandId },
      });
      if (brand) {
        topIssue = `${brandCounts[0]._count.brandId} issues with ${brand.name}`;
      }
    }
    resolutionSuggestion =
      userResolutionRate < 50
        ? "Add more evidence to boost credibility"
        : "Excellent! Your resolution rate is strong";
  }

  return {
    topIssue,
    resolutionSuggestion,
    resolutionRate: userResolutionRate,
    platformResolutionRate,
    brandPerformance,
  };
}

// Brand-specific dashboard functions (for BRAND role users)
export async function getBrandDashboardMetrics(brandIds: string | string[]) {
  const brandIdArray = Array.isArray(brandIds) ? brandIds : [brandIds];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Helper to get count for a period
  const getCount = async (whereClause: any, from?: Date, to?: Date) => {
    const where = { ...whereClause };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lt = to;
    }
    return prisma.complaint.count({ where });
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const commonWhere = { brandId: { in: brandIdArray } };

  // Total Complaints
  const totalComplaints = await getCount(commonWhere);
  const totalCurrent = await getCount(commonWhere, thirtyDaysAgo);
  const totalPrevious = await getCount(
    commonWhere,
    sixtyDaysAgo,
    thirtyDaysAgo,
  );
  const totalComplaintsTrend = calculateTrend(totalCurrent, totalPrevious);

  // Resolved
  const resolvedWhere = { ...commonWhere, status: "RESOLVED" };
  const resolved = await getCount(resolvedWhere);
  const resolvedCurrent = await getCount(resolvedWhere, thirtyDaysAgo);
  const resolvedPrevious = await getCount(
    resolvedWhere,
    sixtyDaysAgo,
    thirtyDaysAgo,
  );
  const resolvedTrend = calculateTrend(resolvedCurrent, resolvedPrevious);

  // Pending
  const pendingStatuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "RESPONDED"];
  const pendingWhere = { ...commonWhere, status: { in: pendingStatuses } };
  const pending = await getCount(pendingWhere);
  const pendingCurrent = await getCount(pendingWhere, thirtyDaysAgo);
  const pendingPrevious = await getCount(
    pendingWhere,
    sixtyDaysAgo,
    thirtyDaysAgo,
  );
  const pendingTrend = calculateTrend(pendingCurrent, pendingPrevious);

  // Needs Info
  const needsInfoWhere = { ...commonWhere, status: "NEEDS_INFO" };
  const needsInfo = await getCount(needsInfoWhere);
  const needsInfoCurrent = await getCount(needsInfoWhere, thirtyDaysAgo);
  const needsInfoPrevious = await getCount(
    needsInfoWhere,
    sixtyDaysAgo,
    thirtyDaysAgo,
  );
  const needsInfoTrend = calculateTrend(needsInfoCurrent, needsInfoPrevious);

  const rejected = await prisma.complaint.count({
    where: { brandId: { in: brandIdArray }, status: "REJECTED" },
  });

  return {
    totalComplaints,
    totalComplaintsTrend,
    resolved,
    resolvedTrend,
    pending,
    pendingTrend,
    needsInfo,
    needsInfoTrend,
    rejected,
  };
}

export async function getBrandComplaintTrends(brandIds: string | string[]) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Normalize to array
  const brandIdArray = Array.isArray(brandIds) ? brandIds : [brandIds];

  const complaints = await prisma.complaint.findMany({
    where: {
      brandId: { in: brandIdArray },
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const monthlyData = new Map<string, number>();
  complaints.forEach((complaint) => {
    const month = complaint.createdAt.toISOString().substring(0, 7);
    monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
  });

  return Array.from(monthlyData.entries()).map(([month, count]) => ({
    month,
    count,
  }));
}

export async function getBrandStatusDistribution(brandIds: string | string[]) {
  // Normalize to array
  const brandIdArray = Array.isArray(brandIds) ? brandIds : [brandIds];

  const statuses = await prisma.complaint.groupBy({
    by: ["status"],
    where: { brandId: { in: brandIdArray } },
    _count: { status: true },
  });

  return statuses.map((s) => ({
    status: s.status,
    count: s._count.status,
  }));
}

export async function getBrandInsights(brandIds: string | string[]) {
  // Normalize to array
  const brandIdArray = Array.isArray(brandIds) ? brandIds : [brandIds];

  const total = await prisma.complaint.count({
    where: { brandId: { in: brandIdArray } },
  });
  const resolved = await prisma.complaint.count({
    where: { brandId: { in: brandIdArray }, status: "RESOLVED" },
  });

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const topIssue =
    total > 0 ? `${total} total complaints received` : "No complaints yet";
  const resolutionSuggestion =
    resolutionRate < 50
      ? "Response time is critical - aim to respond within 24 hours"
      : "Great service! Customers appreciate quick responses";

  return {
    topIssue,
    resolutionSuggestion,
    resolutionRate,
  };
}

export async function getBrandComplaintList(params: {
  brandIds: string[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string | undefined;
  search?: string | undefined;
}) {
  const {
    brandIds,
    limit = 20,
    offset = 0,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    search,
  } = params;

  const where: any = {
    brandId: { in: brandIds },
  };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { aiSummary: { contains: search, mode: "insensitive" } },
      {
        user: {
          name: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  const [total, complaints] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    items: complaints.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      userName: c.user?.name || "Anonymous",
      brandName: c.brand?.name || "Unknown",
      brandLogoUrl: c.brand?.logoUrl,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}
