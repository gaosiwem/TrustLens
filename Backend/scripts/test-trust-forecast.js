import { predictTrustTrend } from "../src/modules/trust/trust.service.js";
import { prisma } from "../src/lib/prisma.js";
async function main() {
    console.log("🧪 Testing Trust Trend Score (AI Forecast) Logic...");
    // 1. Setup Data
    const timestamp = Date.now();
    const brand = await prisma.brand.create({
        data: { name: `Forecast Test Brand ${timestamp}` },
    });
    console.log(`✅ Created Brand: ${brand.name}`);
    // 2. Create historical scores for the last 6 months
    console.log("📈 Injecting historical trust scores...");
    const scores = [80, 82, 85, 84, 88, 90]; // Uptrend
    for (let i = 0; i < scores.length; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        await prisma.trustScore.create({
            data: {
                entityType: "BRAND",
                entityId: brand.id,
                score: scores[i],
                riskLevel: "LOW",
                evaluatedAt: date,
                metadata: {},
            },
        });
    }
    // 3. Test Forecast Calculation
    console.log("🔮 Calculating forecast...");
    const result = await predictTrustTrend("BRAND", brand.id);
    if (result) {
        console.log("✅ Forecast Result:", JSON.stringify(result, null, 2));
        if (result.trendDirection === "UP") {
            console.log("✅ Success: Trend direction correctly identified as UP.");
        }
        else {
            console.error(`❌ Failure: Trend direction was ${result.trendDirection}, expected UP.`);
        }
        if (result.forecast.length === 3) {
            console.log("✅ Success: Forecasted next 3 months.");
        }
        else {
            console.error(`❌ Failure: Expected 3 months forecast, got ${result.forecast.length}.`);
        }
    }
    else {
        console.error("❌ Failure: Could not calculate forecast.");
    }
    // Cleanup
    console.log("🧹 Cleaning up...");
    await prisma.trustScore.deleteMany({ where: { entityId: brand.id } });
    await prisma.brand.delete({ where: { id: brand.id } });
}
main().catch((err) => console.error(err));
//# sourceMappingURL=test-trust-forecast.js.map