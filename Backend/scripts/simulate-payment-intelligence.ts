import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function simulateIntelligencePayment() {
  // Hardcoded for debugging user issue
  const brandId = "fd766cd1-7196-4114-9438-ba1ec7c4ad66";

  // Intelligence & Monitoring Plans (non-Verified)
  // Options: FREE, PRO, BUSINESS, ENTERPRISE
  const planCode = "PRO"; // Change to BUSINESS or ENTERPRISE if needed

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { code: planCode },
  });

  if (!plan) {
    console.error(`Plan ${planCode} not found`);
    console.log("Available plans: FREE, PRO, BUSINESS, ENTERPRISE");
    return;
  }

  console.log(`\n🚀 Simulating Intelligence payment for brand: Mit Mak Motors`);
  console.log(`Plan: ${plan.name} (${planCode})`);
  console.log(`Price: R${plan.monthlyPrice}/month`);

  const durationDays = 30; // Monthly subscription
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + durationDays);

  // Find existing subscription for this brand + plan combination
  const existingSub = await prisma.brandSubscription.findFirst({
    where: { brandId, planId: plan.id },
  });

  let subscription;
  if (existingSub) {
    subscription = await prisma.brandSubscription.update({
      where: { id: existingSub.id },
      data: {
        status: "ACTIVE",
        startedAt: new Date(),
        endsAt,
        gatewayRef: "TEST_INTELLIGENCE_" + Date.now(),
      },
    });
    console.log(`✅ Updated existing BrandSubscription: ${subscription.id}`);
  } else {
    subscription = await prisma.brandSubscription.create({
      data: {
        brandId,
        planId: plan.id,
        status: "ACTIVE",
        startedAt: new Date(),
        endsAt,
        gatewayRef: "TEST_INTELLIGENCE_" + Date.now(),
      },
    });
    console.log(`✅ Created new BrandSubscription: ${subscription.id}`);
  }

  // Create payment transaction
  const transaction = await prisma.paymentTransaction.create({
    data: {
      brandId,
      subscriptionId: subscription.id,
      amount: Math.round(Number(plan.monthlyPrice) * 100),
      currency: "ZAR",
      gateway: "PAYFAST",
      gatewayRef: "TEST_INTELLIGENCE_" + Date.now(),
      status: "SUCCESS",
    },
  });

  console.log(`✅ Created PaymentTransaction: ${transaction.id}`);
  console.log(`\n🎉 Intelligence payment simulation complete!`);
  console.log(`Plan: ${plan.name}`);
  console.log(`Subscription expires: ${endsAt.toLocaleDateString()}`);

  // Show all active subscriptions for this brand
  const allSubs = await prisma.brandSubscription.findMany({
    where: { brandId, status: "ACTIVE" },
    include: { plan: true },
  });

  console.log(`\n📋 All active subscriptions for this brand:`);
  allSubs.forEach((sub) => {
    console.log(
      `  - ${sub.plan.name} (expires: ${sub.endsAt?.toLocaleDateString()})`,
    );
  });
}

simulateIntelligencePayment()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
