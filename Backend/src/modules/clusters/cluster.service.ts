import prisma from "../../prismaClient.js";

export async function detectClusters(brandId: string, keyword: string) {
  const count = await prisma.complaint.count({
    where: {
      brandId,
      description: { contains: keyword, mode: "insensitive" },
    },
  });

  if (count >= 10) {
    await prisma.complaintCluster.create({
      data: { brandId, keyword, count, windowHr: 72 },
    });
  }
}
