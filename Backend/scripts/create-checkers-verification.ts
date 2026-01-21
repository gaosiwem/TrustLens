import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function createCheckersVerification() {
  // Find Checkers brand
  const brand = await prisma.brand.findFirst({
    where: { name: "Checkers" },
    include: { manager: true },
  });

  if (!brand) {
    console.error("Checkers brand not found. Creating one...");
    // You'll need to create the brand first
    return;
  }

  if (!brand.managerId) {
    console.error("Checkers has no manager. Please assign a manager first.");
    return;
  }

  console.log(`Creating verification request for: ${brand.name}`);

  // Create verification request
  const request = await prisma.verifiedRequest.create({
    data: {
      brandId: brand.id,
      userId: brand.managerId,
      companyName: brand.name,
      status: "PENDING",
      documents: [
        {
          type: "business_registration",
          path: "/uploads/checkers-business-reg.pdf",
          originalName: "business-registration.pdf",
          uploadedAt: new Date().toISOString(),
        },
        {
          type: "director_id",
          path: "/uploads/checkers-director-id.pdf",
          originalName: "director-id.pdf",
          uploadedAt: new Date().toISOString(),
        },
        {
          type: "proof_of_address",
          path: "/uploads/checkers-proof-address.pdf",
          originalName: "proof-of-address.pdf",
          uploadedAt: new Date().toISOString(),
        },
      ],
    },
  });

  console.log(`✅ Created verification request: ${request.id}`);

  // Now simulate payment for PREMIUM_VERIFIED (R500)
  const planCode = "PREMIUM_VERIFIED";
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { code: planCode },
  });

  if (!plan) {
    console.error(`Plan ${planCode} not found`);
    return;
  }

  console.log(`\nSimulating payment...`);
  console.log(`Plan: ${plan.name} (${planCode})`);
  console.log(`Price: R${plan.monthlyPrice}`);

  const isVerifiedPlan = planCode.includes("VERIFIED");
  const durationDays = isVerifiedPlan ? 365 : 30;
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + durationDays);

  // Create BrandSubscription
  const subscription = await prisma.brandSubscription.upsert({
    where: { brandId: brand.id },
    update: {
      planId: plan.id,
      status: "ACTIVE",
      startedAt: new Date(),
      endsAt,
      gatewayRef: "TEST_CHECKERS_" + Date.now(),
    },
    create: {
      brandId: brand.id,
      planId: plan.id,
      status: "ACTIVE",
      startedAt: new Date(),
      endsAt,
      gatewayRef: "TEST_CHECKERS_" + Date.now(),
    },
  });

  console.log(`✅ Created BrandSubscription: ${subscription.id}`);

  // Create VerifiedSubscription
  const verifiedSub = await prisma.verifiedSubscription.create({
    data: {
      userId: brand.managerId,
      verifiedRequestId: request.id,
      status: "ACTIVE",
      paymentGateway: "PAYFAST",
      paymentReference: "TEST_CHECKERS_" + Date.now(),
      amount: plan.monthlyPrice,
      startDate: new Date(),
      endDate: endsAt,
    },
  });

  console.log(`✅ Created VerifiedSubscription: ${verifiedSub.id}`);

  // Create payment transaction
  const transaction = await prisma.paymentTransaction.create({
    data: {
      brandId: brand.id,
      subscriptionId: subscription.id,
      amount: Math.round(Number(plan.monthlyPrice) * 100),
      currency: "ZAR",
      gateway: "PAYFAST",
      gatewayRef: "TEST_CHECKERS_" + Date.now(),
      status: "SUCCESS",
    },
  });

  console.log(`✅ Created PaymentTransaction: ${transaction.id}`);
  console.log(`\n🎉 Checkers verification setup complete!`);
  console.log(`Subscription expires: ${endsAt.toLocaleDateString()}`);
}

createCheckersVerification()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
