import prisma from "../../prismaClient.js";

export async function getPlatformStats() {
  const [total, resolved, pending] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: "RESOLVED" } }),
    prisma.complaint.count({
      where: {
        status: {
          in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "NEEDS_INFO"],
        },
      },
    }),
  ]);

  // Calculate average resolution time
  const resolvedComplaints = await prisma.complaint.findMany({
    where: {
      status: "RESOLVED",
    },
    select: {
      createdAt: true,
      updatedAt: true,
    },
  });

  let avgResolutionHours = null;
  if (resolvedComplaints.length > 0) {
    const totalHours = resolvedComplaints.reduce((sum, complaint) => {
      if (!complaint.updatedAt) return sum;
      const diff =
        complaint.updatedAt.getTime() - complaint.createdAt.getTime();
      return sum + diff / (1000 * 60 * 60); // Convert ms to hours
    }, 0);
    avgResolutionHours = totalHours / resolvedComplaints.length;
  }

  return {
    totalComplaints: total,
    resolved,
    open: pending,
    avgResolutionHours: avgResolutionHours
      ? Math.round(avgResolutionHours * 10) / 10
      : null,
  };
}

export async function getSubmissionTrend(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const complaints = await prisma.complaint.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const trendMap = new Map<string, number>();
  complaints.forEach((complaint) => {
    const date = complaint.createdAt.toISOString().split("T")[0];
    if (date) {
      trendMap.set(date, (trendMap.get(date) || 0) + 1);
    }
  });

  return Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

export async function getResolutionTrend(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const complaints = await prisma.complaint.findMany({
    where: {
      status: "RESOLVED",
      updatedAt: { gte: startDate },
    },
    select: {
      updatedAt: true,
    },
    orderBy: { updatedAt: "asc" },
  });

  // Group by date
  const trendMap = new Map<string, number>();
  complaints.forEach((complaint) => {
    const date = complaint.updatedAt.toISOString().split("T")[0];
    if (date) {
      trendMap.set(date, (trendMap.get(date) || 0) + 1);
    }
  });

  return Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

export async function getStatusBreakdown() {
  const statuses = await prisma.complaint.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return statuses.map((s) => ({
    status: s.status,
    count: s._count.status,
  }));
}

export async function getAdminComplaintList(params: {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  search?: string;
}) {
  const {
    limit = 20,
    offset = 0,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    search,
  } = params;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      take: limit,
      skip: offset,
      where,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        brandId: true,
        status: true,
        createdAt: true,
        brand: {
          select: {
            name: true,
            logoUrl: true,
            isVerified: true,
          },
        },
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return {
    items: complaints.map((c) => ({
      id: c.id,
      brandName: c.brand?.name || "Unknown",
      brandLogoUrl: c.brand?.logoUrl,
      isVerified: c.brand?.isVerified || false,
      status: c.status,
      submittedAt: c.createdAt.toISOString(),
    })),
    total,
  };
}
