import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function checkSentiment() {
    const eventCount = await prisma.sentimentEvent.count();
    const dailyCount = await prisma.brandSentimentDaily.count();
    console.log("SentimentEvent count:", eventCount);
    console.log("BrandSentimentDaily count:", dailyCount);
    if (eventCount > 0) {
        const recentEvents = await prisma.sentimentEvent.findMany({
            take: 3,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                brandId: true,
                label: true,
                score: true,
                urgency: true,
                topics: true,
                sourceType: true,
                sourceId: true,
                createdAt: true,
            },
        });
        console.log("\nRecent sentiment events:");
        console.log(JSON.stringify(recentEvents, null, 2));
    }
}
checkSentiment()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-sentiment.js.map