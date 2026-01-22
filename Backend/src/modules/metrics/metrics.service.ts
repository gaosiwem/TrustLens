import prisma from "../../lib/prisma.js";

export async function getSystemMetrics() {
  const [totalUsers, totalComplaints, activeUsers, totalBrands] =
    await Promise.all([
      prisma.user.count(),
      prisma.complaint.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.brand.count(),
    ]);

  return {
    totalUsers,
    totalComplaints,
    activeUsers,
    totalBrands,
    timestamp: new Date(),
  };
}

export async function getSystemHealth() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
      status: "healthy",
      uptime: Math.floor(uptime),
      memory: {
        used: Math.floor(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.floor(memoryUsage.heapTotal / 1024 / 1024), // MB
      },
      database: "connected",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: "Database connection failed",
    };
  }
}

export async function getUsageStats() {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get daily complaint counts for last 7 days
  const complaints = await prisma.complaint.groupBy({
    by: ["createdAt"],
    where: {
      createdAt: {
        gte: last7Days,
      },
    },
    _count: true,
  });

  return {
    dailyComplaints: complaints.map((c) => ({
      date: c.createdAt.toISOString().split("T")[0],
      count: c._count,
    })),
  };
}
