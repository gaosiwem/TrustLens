import { describe, it, expect } from "@jest/globals";
import { computeScore } from "../modules/reputation/reputation.engine.js";

describe("Reputation Engine", () => {
  it("computes bayesian score correctly", () => {
    // 100 reviews, avg 0.3, platform mean 0.2, confidence 10, 90% resolution rate
    const score = computeScore(100, 0.3, 0.2, 10, 0.9);

    // Expected: ((100 * 0.3) + (10 * 0.2)) / (100 + 10) = 32 / 110 ≈ 0.29
    // With resolution multiplier: 0.29 * (1 + 0.9) = 0.29 * 1.9 ≈ 0.55
    expect(score).toBeGreaterThan(0.5);
    expect(score).toBeLessThan(0.6);
  });

  it("handles zero reviews gracefully", () => {
    const score = computeScore(0, 0, 0.2, 10, 0);
    // Should return platform mean when no reviews
    expect(score).toBe(0.2);
  });

  it("applies resolution rate bonus correctly", () => {
    const baseScore = computeScore(10, 0.5, 0.2, 5, 0);
    const bonusScore = computeScore(10, 0.5, 0.2, 5, 1.0); // 100% resolution

    expect(bonusScore).toBeGreaterThan(baseScore);
    expect(bonusScore).toBeCloseTo(baseScore * 2); // 1 + 1.0 = 2x multiplier
  });
});

import { prisma } from "../lib/prisma.js";
import { recalcBrandScore } from "../modules/reputation/reputation.service.js";
import { ComplaintStatus } from "@prisma/client";

describe("Reputation Service Integration", () => {
  let brandId: string;
  let userId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `reputation-test-${Date.now()}@test.com`,
        password: "hashedpassword",
        name: "Reputation Tester",
      },
    });
    userId = user.id;

    const brand = await prisma.brand.create({
      data: { name: `Test Brand Reputation ${Date.now()}` },
    });
    brandId = brand.id;
  });

  afterAll(async () => {
    await prisma.reputationScore.deleteMany({ where: { brandId } });
    await prisma.complaint.deleteMany({ where: { brandId } });
    await prisma.brand.delete({ where: { id: brandId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it("calculates and stores score correctly", async () => {
    // Create some complaints
    await prisma.complaint.createMany({
      data: [
        {
          userId,
          brandId,
          title: "Bad",
          description: "Bad",
          sentimentScore: -0.5,
          status: ComplaintStatus.RESOLVED,
        },
        {
          userId,
          brandId,
          title: "Good",
          description: "Good",
          sentimentScore: 0.5,
          status: ComplaintStatus.SUBMITTED,
        },
      ],
    });

    await recalcBrandScore(brandId);

    const scoreEntry = await prisma.reputationScore.findUnique({
      where: { brandId },
    });

    expect(scoreEntry).toBeDefined();
    expect(scoreEntry?.score).toBeDefined();
    // 2 complaints: one resolved, one submitted = 50% resolution rate
    // Sentiment avg: (-0.5 + 0.5) / 2 = 0
    // Bayesian avg with platformMean=0 (recalcBrandScore uses 0.0) should be near 0
    // Result = bayesian * (1 + 0.5) = 1.5 * bayesian
    expect(scoreEntry?.score).toBeGreaterThanOrEqual(0);
  });
});
