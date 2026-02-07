import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    console.log("🚀 Upgrading VERIFIED plan with Premium features...");
    const verifiedPlan = await prisma.subscriptionPlan.findUnique({
        where: { code: "VERIFIED" },
    });
    if (!verifiedPlan) {
        console.error("❌ VERIFIED plan not found. Please run migration first.");
        return;
    }
    // Define the expanded feature set
    const features = {
        verifiedBadge: true,
        badgeColor: "green",
        annualRevalidation: true,
        standardQueue: false, // Removing standard
        priorityQueue: true, // Adding Premium
        disputeClarification: "fast", // Upgrading to fast
        auditTrail: true, // Adding Premium
        extendedVisibility: true, // Adding Premium
    };
    const updated = await prisma.subscriptionPlan.update({
        where: { id: verifiedPlan.id },
        data: { features },
    });
    console.log("✅ VERIFIED plan updated with new features:", JSON.stringify(updated.features, null, 2));
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=update-verified-features.js.map