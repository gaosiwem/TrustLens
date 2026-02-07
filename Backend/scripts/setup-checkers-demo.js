import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function setupCheckers() {
    console.log("Setting up Checkers brand for benchmarking demo...");
    // 1. Find Checkers
    let brand = await prisma.brand.findFirst({
        where: { name: { equals: "Checkers", mode: "insensitive" } },
    });
    if (!brand) {
        console.log("Checkers brand not found. Creating it...");
        brand = await prisma.brand.create({
            data: {
                name: "Checkers",
                isVerified: true,
                logoUrl: "https://www.checkers.co.za/logo.png",
            },
        });
    }
    else {
        console.log(`Found Checkers (ID: ${brand.id})`);
        await prisma.brand.update({
            where: { id: brand.id },
            data: { isVerified: true },
        });
    }
    // 2. Ensure BUSINESS Plan exists
    let businessPlan = await prisma.subscriptionPlan.findUnique({
        where: { code: "BUSINESS" },
    });
    if (!businessPlan) {
        console.log("BUSINESS plan not found. Seeding basic plans...");
        // This is a bit risky if many plans exist, but let's just make sure BUSINESS is there
        businessPlan = await prisma.subscriptionPlan.create({
            data: {
                name: "Business Intelligence",
                code: "BUSINESS",
                monthlyPrice: 299900, // R2,999.00
                features: {
                    alerts: true,
                    aiInsights: true,
                    sentimentTracking: true,
                    brandAudit: true,
                    customDescription: true,
                    trustTrend: true,
                    riskSignals: true,
                    rootCauseAI: true,
                    teamSLA: true,
                    historicalBenchmarking: true,
                    apiAccess: true,
                },
            },
        });
    }
    // 3. Give Checkers an active BUSINESS subscription
    const endsAt = new Date();
    endsAt.setFullYear(endsAt.getFullYear() + 1);
    await prisma.brandSubscription.upsert({
        where: {
            brandId_planId: {
                brandId: brand.id,
                planId: businessPlan.id,
            },
        },
        update: {
            status: "ACTIVE",
            endsAt,
        },
        create: {
            brandId: brand.id,
            planId: businessPlan.id,
            status: "ACTIVE",
            startedAt: new Date(),
            endsAt,
            gatewayRef: "DEMO_SEED",
        },
    });
    console.log("Checkers is now VERIFIED and has an active BUSINESS subscription!");
}
setupCheckers()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=setup-checkers-demo.js.map