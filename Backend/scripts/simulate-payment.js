import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function simulatePayment() {
    // Find Checkers brand
    const brand = await prisma.brand.findFirst({
        where: { name: "Checkers" },
    });
    if (!brand) {
        console.error("Checkers brand not found");
        return;
    }
    const brandId = brand.id;
    const userId = brand.managerId || "dfa6c5af-f491-426a-b66f-b52638525a42";
    // Ask which plan to simulate
    const planCode = "BASIC_VERIFIED"; // Change to PREMIUM_VERIFIED if needed
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { code: planCode },
    });
    if (!plan) {
        console.error(`Plan ${planCode} not found`);
        return;
    }
    console.log(`Simulating payment for brand: Checkers`);
    console.log(`Plan: ${plan.name} (${planCode})`);
    console.log(`Price: R${plan.monthlyPrice}`);
    const isVerifiedPlan = planCode.includes("VERIFIED");
    const durationDays = isVerifiedPlan ? 365 : 30;
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
                gatewayRef: "TEST_PAYMENT_" + Date.now(),
            },
        });
    }
    else {
        subscription = await prisma.brandSubscription.create({
            data: {
                brandId,
                planId: plan.id,
                status: "ACTIVE",
                startedAt: new Date(),
                endsAt,
                gatewayRef: "TEST_PAYMENT_" + Date.now(),
            },
        });
    }
    console.log(`✅ Created BrandSubscription: ${subscription.id}`);
    // Update Brand table with verified status and widget plan
    const widgetPlans = ["PRO", "BUSINESS", "ENTERPRISE", "FREE"];
    const matchedPlan = widgetPlans.find((p) => planCode.includes(p));
    const updateData = {};
    if (isVerifiedPlan)
        updateData.isVerified = true;
    if (matchedPlan)
        updateData.widgetPlan = matchedPlan;
    if (Object.keys(updateData).length > 0) {
        await prisma.brand.update({
            where: { id: brandId },
            data: updateData,
        });
        console.log(`✅ Updated Brand table (${JSON.stringify(updateData)})`);
    }
    // Create VerifiedSubscription if it's a verified plan
    /*
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
    */
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
//# sourceMappingURL=simulate-payment.js.map