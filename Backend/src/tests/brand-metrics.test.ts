import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import prisma from "../prismaClient.js";
import { recalcBrandScore } from "../modules/reputation/reputation.service.js";
import { ComplaintStatus } from "@prisma/client";

describe("Brand Metrics Core Logic", () => {
  let brandId: string;
  let userId: string;

  beforeAll(async () => {
    // Setup test user and brand
    const user = await prisma.user.create({
      data: {
        email: `metrics-user-${Date.now()}@test.com`,
        password: "password",
        name: "Metrics User",
      },
    });
    userId = user.id;

    const brand = await prisma.brand.create({
      data: { name: `Metric Brand ${Date.now()}` },
    });
    brandId = brand.id;
  });

  afterAll(async () => {
    await prisma.reputationScore.deleteMany({ where: { brandId } });
    await prisma.complaint.deleteMany({ where: { brandId } });
    await prisma.brand.delete({ where: { id: brandId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it("calculates accurate resolution rate and sentiment for metrics", async () => {
    // 1. Add Resolved Complaint (Positive Sentiment)
    await prisma.complaint.create({
      data: {
        userId,
        brandId,
        title: "Good",
        description: "Great service",
        sentimentScore: 0.8,
        status: ComplaintStatus.RESOLVED,
      },
    });

    // 2. Add Pending Complaint (Negative Sentiment)
    await prisma.complaint.create({
      data: {
        userId,
        brandId,
        title: "Bad",
        description: "Slow delivery",
        sentimentScore: -0.4,
        status: ComplaintStatus.SUBMITTED,
      },
    });

    await recalcBrandScore(brandId);

    const metrics = await prisma.reputationScore.findUnique({
      where: { brandId },
    });

    expect(metrics).toBeDefined();
    // Bayesian avg with confidence 5 and platform mean 0:
    // Sentiment avg = (0.8 + -0.4) / 2 = 0.2
    // Resolution rate = 1 / 2 = 0.5
    // Bayesian = (2 * 0.2 + 5 * 0) / (2 + 5) = 0.4 / 7 ≈ 0.057
    // Final = 0.057 * (1 + 0.5) = 1.5 * 0.057 ≈ 0.085
    expect(metrics?.score).toBeGreaterThan(0.05);
    expect(metrics?.score).toBeLessThan(0.12);
  });
});
