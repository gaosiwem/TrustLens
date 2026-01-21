import prisma from "../../prismaClient.js";

export async function getDashboardMetrics(userId: string) {
  // Get complaint counts by status
  const totalComplaints = await prisma.complaint.count({
    where: { userId },
  });

  const resolved = await prisma.complaint.count({
    where: { userId, status: "RESOLVED" },
  });

  // Pending includes: DRAFT, SUBMITTED, UNDER_REVIEW, and RESPONDED (awaiting final resolution)
  const pending = await prisma.complaint.count({
    where: {
      userId,
      status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "RESPONDED"] },
    },
  });

  const needsInfo = await prisma.complaint.count({
    where: { userId, status: "NEEDS_INFO" },
  });

  const rejected = await prisma.complaint.count({
    where: { userId, status: "REJECTED" },
  });

  return {
    totalComplaints,
    resolved,
    pending,
    needsInfo,
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
  // Get most common brand (top issue)
  const brandCounts = await prisma.complaint.groupBy({
    by: ["brandId"],
    where: { userId },
    _count: { brandId: true },
    orderBy: { _count: { brandId: "desc" } },
    take: 1,
  });

  let topIssue = "No complaints yet";
  if (brandCounts.length > 0) {
    const topBrand = brandCounts[0]!;
    const brandId = topBrand.brandId;
    if (brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
      });
      if (brand) {
        topIssue = `${topBrand._count.brandId} complaints about ${brand.name}`;
      }
    }
  }

  // Calculate resolution rate for suggestion
  const total = await prisma.complaint.count({ where: { userId } });
  const resolved = await prisma.complaint.count({
    where: { userId, status: "RESOLVED" },
  });

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const resolutionSuggestion =
    resolutionRate < 50
      ? "Follow up on pending complaints to improve resolution rate"
      : "Great job! Keep monitoring response times";

  return {
    topIssue,
    resolutionSuggestion,
    resolutionRate,
  };
}

// Brand-specific dashboard functions (for BRAND role users)
export async function getBrandDashboardMetrics(brandIds: string | string[]) {
  // Normalize to array for consistent handling
  const brandIdArray = Array.isArray(brandIds) ? brandIds : [brandIds];

  const totalComplaints = await prisma.complaint.count({
    where: { brandId: { in: brandIdArray } },
  });

  const resolved = await prisma.complaint.count({
    where: { brandId: { in: brandIdArray }, status: "RESOLVED" },
  });

  // Pending includes: DRAFT, SUBMITTED, UNDER_REVIEW, and RESPONDED (awaiting final resolution)
  const pending = await prisma.complaint.count({
    where: {
      brandId: { in: brandIdArray },
      status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "RESPONDED"] },
    },
  });

  const needsInfo = await prisma.complaint.count({
    where: { brandId: { in: brandIdArray }, status: "NEEDS_INFO" },
  });

  const rejected = await prisma.complaint.count({
    where: { brandId: { in: brandIdArray }, status: "REJECTED" },
  });

  return {
    totalComplaints,
    resolved,
    pending,
    needsInfo,
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
