import prisma from "../../lib/prisma.js";

export async function createRating(params: {
  userId: string;
  complaintId: string;
  stars: number;
  comment?: string;
}) {
  // Validate stars range
  if (params.stars < 1 || params.stars > 5) {
    throw new Error("Stars must be between 1 and 5");
  }

  return prisma.$transaction(async (tx) => {
    // Create or update the rating
    const rating = await tx.rating.upsert({
      where: {
        userId_complaintId: {
          userId: params.userId,
          complaintId: params.complaintId,
        },
      },
      update: {
        stars: params.stars,
        comment: params.comment || null,
      },
      create: {
        userId: params.userId,
        complaintId: params.complaintId,
        stars: params.stars,
        comment: params.comment || null,
      },
    });

    // Get current complaint status
    const complaint = await tx.complaint.findUnique({
      where: { id: params.complaintId },
      select: { status: true },
    });

    // Update complaint status to RESOLVED if not already
    if (complaint && complaint.status !== "RESOLVED") {
      await tx.complaint.update({
        where: { id: params.complaintId },
        data: { status: "RESOLVED" },
      });

      // Log the status change
      await tx.complaintStatusHistory.create({
        data: {
          complaintId: params.complaintId,
          fromStatus: complaint.status,
          toStatus: "RESOLVED",
          changedBy: params.userId,
        },
      });
    }

    return rating;
  });
}

export async function getRatingsForComplaint(complaintId: string) {
  const ratings = await prisma.rating.findMany({
    where: { complaintId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate statistics
  const stats = await prisma.rating.aggregate({
    where: { complaintId },
    _avg: { stars: true },
    _count: { stars: true },
  });

  return {
    ratings,
    stats: {
      average: stats._avg.stars || 0,
      count: stats._count.stars || 0,
    },
  };
}

export async function getUserRating(userId: string, complaintId: string) {
  return prisma.rating.findUnique({
    where: {
      userId_complaintId: {
        userId,
        complaintId,
      },
    },
  });
}

export async function getRecentRatings(limit: number = 10) {
  return prisma.rating.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      complaint: {
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
          followups: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              user: {
                select: {
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
