import { prisma } from "../src/lib/prisma.js";
async function main() {
    console.log("Updating Verified Plans to enable 'alerts'...");
    // Find all plans that are related to Verification
    const plans = await prisma.subscriptionPlan.findMany({
        where: {
            code: { in: ["PRO_VERIFIED"] },
        },
    });
    for (const plan of plans) {
        const features = plan.features || {};
        // Add alerts: true if missing
        if (!features.alerts) {
            features.alerts = true;
            await prisma.subscriptionPlan.update({
                where: { id: plan.id },
                data: { features },
            });
            console.log(`Updated plan ${plan.name} (${plan.code}) with alerts: true`);
        }
        else {
            console.log(`Plan ${plan.name} (${plan.code}) already has alerts enabled.`);
        }
    }
}
main()
    .catch((e) => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=enable-alerts-for-verified.js.map