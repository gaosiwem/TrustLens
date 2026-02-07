import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function updateCheckersSubscription() {
    // Find Checkers brand
    const brand = await prisma.brand.findFirst({
        where: { name: "Checkers" },
    });
    if (!brand) {
        console.error("Checkers brand not found");
        return;
    }
    console.log(`Updating subscription for: ${brand.name}`);
    // Delete existing subscription records
    await prisma.paymentTransaction.deleteMany({
        where: { brandId: brand.id },
    });
    console.log("✅ Deleted PaymentTransactions");
    await prisma.verifiedSubscription.deleteMany({
        where: {
            verifiedRequest: { brandId: brand.id },
        },
    });
    console.log("✅ Deleted VerifiedSubscriptions");
    await prisma.brandSubscription.deleteMany({
        where: { brandId: brand.id },
    });
    console.log("✅ Deleted BrandSubscription");
    // Get the verification request
    const request = await prisma.verifiedRequest.findFirst({
        where: { brandId: brand.id, status: "PENDING" },
    });
    if (!request) {
        console.error("No pending verification request found for Checkers");
        return;
    }
    // Get BASIC_VERIFIED plan
    const planCode = "BASIC_VERIFIED";
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { code: planCode },
    });
    if (!plan) {
        console.error(`Plan ${planCode} not found`);
        return;
    }
    console.log(`\nCreating new subscription...`);
    console.log(`Plan: ${plan.name} (${planCode})`);
    console.log(`Price: R${plan.monthlyPrice / 100}`);
    const durationDays = 365;
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + durationDays);
    // Create BrandSubscription
    const subscription = await prisma.brandSubscription.create({
        data: {
            brandId: brand.id,
            planId: plan.id,
            status: "ACTIVE",
            startedAt: new Date(),
            endsAt,
            gatewayRef: "TEST_CHECKERS_BASIC_" + Date.now(),
        },
    });
    console.log(`✅ Created BrandSubscription: ${subscription.id}`);
    // Create VerifiedSubscription
    const verifiedSub = await prisma.verifiedSubscription.create({
        data: {
            userId: request.userId,
            verifiedRequestId: request.id,
            status: "ACTIVE",
            paymentGateway: "PAYFAST",
            paymentReference: "TEST_CHECKERS_BASIC_" + Date.now(),
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
            gatewayRef: "TEST_CHECKERS_BASIC_" + Date.now(),
            status: "SUCCESS",
        },
    });
    console.log(`✅ Created PaymentTransaction: ${transaction.id}`);
    console.log(`\n🎉 Checkers updated to BASIC_VERIFIED!`);
    console.log(`Price: R${plan.monthlyPrice / 100}`);
    console.log(`Subscription expires: ${endsAt.toLocaleDateString()}`);
}
updateCheckersSubscription()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=update-checkers-to-basic.js.map