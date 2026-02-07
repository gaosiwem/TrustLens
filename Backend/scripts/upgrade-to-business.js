import { prisma } from "../src/lib/prisma.js";
async function main() {
    const brandId = "821e7b12-2ea7-4b27-9cea-81eff46209bc";
    const planCode = "BUSINESS";
    console.log(`🚀 Upgrading brand ${brandId} to ${planCode}...`);
    try {
        // 1. Find the BUSINESS plan
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { code: planCode },
        });
        if (!plan) {
            console.error(`❌ Plan ${planCode} not found in database.`);
            return;
        }
        // 2. Clear existing active subscriptions for this brand to avoid conflicts
        await prisma.brandSubscription.updateMany({
            where: {
                brandId,
                status: "ACTIVE",
            },
            data: {
                status: "CANCELLED",
                endsAt: new Date(),
            },
        });
        // 3. Upsert the BUSINESS subscription
        const endsAt = new Date();
        endsAt.setFullYear(endsAt.getFullYear() + 1); // 1 year duration
        const subscription = await prisma.brandSubscription.upsert({
            where: {
                brandId_planId: {
                    brandId,
                    planId: plan.id,
                },
            },
            update: {
                status: "ACTIVE",
                startedAt: new Date(),
                endsAt,
                gatewayRef: "MANUAL_UPGRADE_SCRIPT_FIXED",
            },
            create: {
                brandId,
                planId: plan.id,
                status: "ACTIVE",
                startedAt: new Date(),
                endsAt,
                gatewayRef: "MANUAL_UPGRADE_SCRIPT_FIXED",
            },
        });
        console.log("✅ Subscription updated successfully!");
        console.log(JSON.stringify(subscription, null, 2));
    }
    catch (error) {
        console.error("❌ Error during upgrade:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=upgrade-to-business.js.map