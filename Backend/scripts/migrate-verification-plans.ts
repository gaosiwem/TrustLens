import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting migration: Consolidating Verification Plans...");

  // 1. Find or Create the new VERIFIED plan
  let verifiedPlan = await prisma.subscriptionPlan.findUnique({
    where: { code: "VERIFIED" },
  });

  if (!verifiedPlan) {
    console.log("creating VERIFIED plan...");
    verifiedPlan = await prisma.subscriptionPlan.create({
      data: {
        code: "VERIFIED",
        name: "Verified Brand",
        monthlyPrice: 50000,
        features: {
          verifiedBadge: true,
          badgeColor: "green",
          annualRevalidation: true,
          standardQueue: true,
        },
      },
    });
  }

  // 2. Migrate existing subscriptions
  const deprecatedCodes = ["BASIC_VERIFIED", "PREMIUM_VERIFIED"];

  for (const code of deprecatedCodes) {
    const oldPlan = await prisma.subscriptionPlan.findUnique({
      where: { code },
    });

    if (oldPlan) {
      console.log(`Migrating subscriptions from ${code} to VERIFIED...`);
      const updated = await prisma.brandSubscription.updateMany({
        where: { planId: oldPlan.id },
        data: { planId: verifiedPlan.id },
      });
      console.log(`Moved ${updated.count} subscriptions.`);

      // Delete old plan (will fail if there are constraints, but subscriptions are moved)
      try {
        await prisma.subscriptionPlan.delete({ where: { id: oldPlan.id } });
        console.log(`Deleted deprecated plan: ${code}`);
      } catch (e) {
        console.warn(
          `Could not delete ${code}, likely existing references (e.g. invoices). This is safe to ignore.`,
        );
      }
    }
  }

  console.log("✅ Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
