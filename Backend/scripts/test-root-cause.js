import { PrismaClient } from "@prisma/client";
import { getRootCauseAnalysis } from "../src/modules/brands/analysis.service.js";
const prisma = new PrismaClient();
async function testRootCause() {
    console.log("🚀 Starting Root Cause AI Analysis Test...");
    // 1. Find or create a test brand
    let brand = await prisma.brand.findFirst({
        where: { name: "RootCauseTestBrand" },
    });
    if (!brand) {
        console.log("Creating test brand...");
        brand = await prisma.brand.create({
            data: {
                name: "RootCauseTestBrand",
                description: "A brand for testing systemic issues.",
                websiteUrl: "https://test.com",
                supportEmail: "support@test.com",
            },
        });
    }
    console.log(`Using Brand: ${brand.name} (${brand.id})`);
    // 2. Clear previous test events
    await prisma.sentimentEvent.deleteMany({
        where: { brandId: brand.id },
    });
    // 3. Seed 10 events for a specific topic (e.g., "Subscription Cancellation")
    console.log("Seeding test sentiment events...");
    const topics = [
        "Subscription Cancellation",
        "Billing Error",
        "Customer Service",
    ];
    for (let i = 0; i < 15; i++) {
        const topic = i < 10 ? topics[0] : i < 13 ? topics[1] : topics[2];
        await prisma.sentimentEvent.create({
            data: {
                brandId: brand.id,
                sourceType: "COMPLAINT",
                textHash: "TEST_HASH_" + i,
                model: "gpt-4o",
                label: i % 2 === 0 ? "NEGATIVE" : "NEUTRAL",
                score: -0.5,
                intensity: 0.8,
                urgency: 70,
                topics: [topic],
                createdAt: new Date(),
            },
        });
    }
    // 4. Run analysis
    console.log("Running Root Cause Analysis...");
    const insights = await getRootCauseAnalysis(brand.id);
    console.log("\n📊 ANALYSIS RESULTS:");
    console.log(JSON.stringify(insights, null, 2));
    if (insights.length > 0) {
        console.log("\n✅ Test Passed: Insights generated.");
    }
    else {
        console.log("\n❌ Test Failed: No insights generated.");
    }
}
testRootCause()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=test-root-cause.js.map