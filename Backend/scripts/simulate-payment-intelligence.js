import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function simulateIntelligencePayment() {
    // Find Checkers brand
    const brand = await prisma.brand.findFirst({
        where: { name: "Checkers" },
    });
    if (!brand) {
        console.error("Checkers brand not found");
        return;
    }
    const brandId = brand.id;
    // Intelligence & Monitoring Plans (non-Verified)
    // Options: FREE, PRO, BUSINESS, ENTERPRISE
    const planCode = "BUSINESS"; // Change to BUSINESS or ENTERPRISE if needed
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { code: planCode },
    });
    if (!plan) {
        console.error(`Plan ${planCode} not found`);
        console.log("Available plans: FREE, PRO, BUSINESS, ENTERPRISE");
        return;
    }
    console.log(`\n🚀 Simulating Intelligence payment for brand: ${brand.name}`);
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
    }
    else {
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
    // Update Brand table with verified status and widget plan
    const widgetPlans = ["PRO", "BUSINESS", "ENTERPRISE", "FREE"];
    const matchedPlan = widgetPlans.find((p) => planCode.includes(p));
    if (matchedPlan) {
        await prisma.brand.update({
            where: { id: brandId },
            data: { widgetPlan: matchedPlan },
        });
        console.log(`✅ Updated Brand table (widgetPlan: ${matchedPlan})`);
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
        console.log(`  - ${sub.plan.name} (R${(sub.plan.monthlyPrice / 100).toFixed(2)}) (expires: ${sub.endsAt?.toLocaleDateString()})`);
    });
    const totalMonthlyPrice = allSubs.reduce((acc, sub) => acc + (sub.plan.monthlyPrice || 0), 0);
    console.log(`\n💰 Total Combined Monthly Payment: R${(totalMonthlyPrice / 100).toFixed(2)}`);
}
simulateIntelligencePayment()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=simulate-payment-intelligence.js.map