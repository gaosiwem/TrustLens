import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const brandName = "Checkers";

  const brand = await prisma.brand.findFirst({
    where: { name: brandName },
  });

  if (!brand) {
    console.log(
      `❌ Brand "${brandName}" not found. Run simulation scripts first.`,
    );
    return;
  }

  console.log(
    `🚀 Simulating Trust History for brand: ${brandName} (${brand.id})`,
  );

  // Create 4 historical data points over the last 4 months
  const dataPoints = [
    { daysAgo: 120, score: 65, trend: "Initial" },
    { daysAgo: 90, score: 72, trend: "Improving" },
    { daysAgo: 60, score: 78, trend: "Growing" },
    { daysAgo: 30, score: 85, trend: "Strong" },
    { daysAgo: 0, score: 88, trend: "Current" },
  ];

  // Clean existing scores to start fresh for this simulation if needed
  // await prisma.trustScore.deleteMany({ where: { entityId: brand.id, entityType: 'BRAND' } });

  for (const dp of dataPoints) {
    const evaluatedAt = subDays(new Date(), dp.daysAgo);

    await prisma.trustScore.create({
      data: {
        entityType: "BRAND",
        entityId: brand.id,
        score: dp.score,
        riskLevel: dp.score >= 80 ? "LOW" : dp.score >= 60 ? "MEDIUM" : "HIGH",
        evaluatedAt,
        metadata: {
          simulation: true,
          phase: dp.trend,
          factors: {
            authenticity: dp.score + 5,
            activity: dp.score - 5,
            verification: 80,
          },
        },
      },
    });
    console.log(
      `✅ Created score: ${dp.score} for ${evaluatedAt.toISOString()} (${dp.trend})`,
    );
  }

  console.log(
    "\n🎉 Trust History simulation complete! AI Projection should now be active.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
