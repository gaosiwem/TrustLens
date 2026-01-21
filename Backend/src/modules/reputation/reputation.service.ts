import prisma from "../../prismaClient.js";
import { computeScore } from "./reputation.engine.js";

export async function recalcBrandScore(brandId: string) {
  const complaints = await prisma.complaint.findMany({
    where: { brandId },
    select: { sentimentScore: true, status: true },
  });

  if (complaints.length === 0) return;

  const validComplaints = complaints.filter(
    (c) => (c as any).sentimentScore !== null
  );
  const avg =
    validComplaints.reduce((a, c) => a + ((c as any).sentimentScore || 0), 0) /
    Math.max(validComplaints.length, 1);
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;

  const score = computeScore(
    complaints.length,
    avg,
    0.0, // platform mean (starting point)
    5, // confidence factor
    resolved / complaints.length
  );

  await prisma.reputationScore.upsert({
    where: { brandId },
    update: { score },
    create: { brandId, score },
  });
}
