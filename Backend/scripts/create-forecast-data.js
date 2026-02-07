import { prisma } from "../src/lib/prisma.js";
async function main() {
    const brandId = "821e7b12-2ea7-4b27-9cea-81eff46209bc";
    console.log(`📊 Generating historical TrustScore data for brand ${brandId}...`);
    try {
        // 1. Verify brand exists
        const brand = await prisma.brand.findUnique({
            where: { id: brandId },
        });
        if (!brand) {
            console.error(`❌ Brand ${brandId} not found.`);
            return;
        }
        // 2. Clear previous scores for this brand to have a clean trend
        await prisma.trustScore.deleteMany({
            where: { entityId: brandId, entityType: "BRAND" },
        });
        // 3. Inject 6 months of trending data (Uptrend)
        const scores = [72, 75, 74, 78, 82, 85];
        for (let i = 0; i < scores.length; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            await prisma.trustScore.create({
                data: {
                    entityType: "BRAND",
                    entityId: brandId,
                    score: scores[i],
                    riskLevel: scores[i] >= 80 ? "LOW" : "MEDIUM",
                    evaluatedAt: date,
                    metadata: {
                        factors: {
                            authenticity: 85,
                            activity: 70 + i * 5,
                            verification: 80,
                        },
                    },
                },
            });
        }
        console.log("✅ Historical data injected successfully!");
        console.log("📈 Trend: 72 -> 85 (UPWARD)");
    }
    catch (error) {
        console.error("❌ Error generating test data:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=create-forecast-data.js.map