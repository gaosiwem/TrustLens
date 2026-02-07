import { prisma } from "../src/lib/prisma.js";
async function main() {
    // Use the ID from the logs: 9195926d-8b93-48be-81c7-cf084aae8083 (one of the brands from previous logs)
    // Or just find any brand with a subscription
    const result = await prisma.brandSubscription.findFirst({
        where: {
            status: "ACTIVE",
            brandId: "fd766cd1-7196-4114-9438-ba1ec7c4ad66",
        },
        include: {
            plan: true,
            brand: { select: { name: true } },
        },
    });
    if (!result) {
        console.log("No active subscriptions found.");
        return;
    }
    console.log("Found subscription for:", result.brand.name);
    console.log("Plan:", result.plan.name, result.plan.code);
    console.log("Features:", JSON.stringify(result.plan.features, null, 2));
    // Check the specific logic from notification service
    const hasAlertsFeature = result.plan.features && result.plan.features.alerts === true;
    console.log("Has Alerts Feature:", hasAlertsFeature);
}
main()
    .catch((e) => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check-subscription.js.map