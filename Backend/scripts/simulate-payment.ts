import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function simulatePayment() {
  // Get the pending verification request
  const request = await prisma.verifiedRequest.findFirst({
    where: { status: "PENDING" },
    include: { brand: true },
  });

  if (!request) {
    console.log("No pending verification request found");
    return;
  }

  const brandId = request.brandId;
  const userId = request.userId;

  // Ask which plan to simulate
  const planCode = "BASIC_VERIFIED"; // Change to PREMIUM_VERIFIED if needed

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { code: planCode },
  });

  if (!plan) {
    console.error(`Plan ${planCode} not found`);
    return;
  }

  console.log(`Simulating payment for brand: ${request.brand.name}`);
  console.log(`Plan: ${plan.name} (${planCode})`);
  console.log(`Price: R${plan.monthlyPrice}`);

  const isVerifiedPlan = planCode.includes("VERIFIED");
  const durationDays = isVerifiedPlan ? 365 : 30;
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + durationDays);

  // Create BrandSubscription
  const subscription = await prisma.brandSubscription.upsert({
    where: { brandId },
    update: {
      planId: plan.id,
      status: "ACTIVE",
      startedAt: new Date(),
      endsAt,
      gatewayRef: "TEST_PAYMENT_" + Date.now(),
    },
    create: {
      brandId,
      planId: plan.id,
      status: "ACTIVE",
      startedAt: new Date(),
      endsAt,
      gatewayRef: "TEST_PAYMENT_" + Date.now(),
    },
  });

  console.log(`✅ Created BrandSubscription: ${subscription.id}`);

  // Create VerifiedSubscription if it's a verified plan
  if (isVerifiedPlan) {
    const verifiedSub = await prisma.verifiedSubscription.create({
      data: {
        userId,
        verifiedRequestId: request.id,
        status: "ACTIVE",
        paymentGateway: "PAYFAST",
        paymentReference: "TEST_PAYMENT_" + Date.now(),
        amount: plan.monthlyPrice,
        startDate: new Date(),
        endDate: endsAt,
      },
    });

    console.log(`✅ Created VerifiedSubscription: ${verifiedSub.id}`);
  }

  // Create payment transaction
  const transaction = await prisma.paymentTransaction.create({
    data: {
      brandId,
      subscriptionId: subscription.id,
      amount: Math.round(Number(plan.monthlyPrice) * 100),
      currency: "ZAR",
      gateway: "PAYFAST",
      gatewayRef: "TEST_PAYMENT_" + Date.now(),
      status: "SUCCESS",
    },
  });

  console.log(`✅ Created PaymentTransaction: ${transaction.id}`);
  console.log(`\n🎉 Payment simulation complete!`);
  console.log(`Subscription expires: ${endsAt.toLocaleDateString()}`);
}

simulatePayment()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
