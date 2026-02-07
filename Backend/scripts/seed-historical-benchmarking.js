import { PrismaClient, ComplaintStatus } from "@prisma/client";
import { subMonths, startOfMonth, endOfMonth, setHours, setMinutes, } from "date-fns";
const prisma = new PrismaClient();
async function seedHistoricalData() {
    console.log("Starting historical data seed for Checkers and industry peers...");
    // 1. Find Checkers and other brands in the same category
    const checkers = await prisma.brand.findUnique({
        where: { name: "Checkers" },
    });
    if (!checkers) {
        console.error("Checkers brand not found. Please run seed first.");
        return;
    }
    const category = checkers.category || "General";
    const peers = await prisma.brand.findMany({
        where: {
            category,
            id: { not: checkers.id },
        },
        take: 3,
    });
    console.log(`Brand: ${checkers.name} (Category: ${category})`);
    console.log(`Peers found: ${peers.map((p) => p.name).join(", ")}`);
    // 2. Clear existing complaints for these brands to avoid mess (optional but cleaner for benchmarking)
    // await prisma.complaint.deleteMany({
    //   where: { brandId: { in: [checkers.id, ...peers.map(p => p.id)] } }
    // });
    const consumer = await prisma.user.findFirst({ where: { role: "USER" } });
    if (!consumer) {
        console.error("No consumer user found to attribute complaints to.");
        return;
    }
    // 3. Generate 12 months of data
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const targetDate = subMonths(now, i);
        const monthName = targetDate.toLocaleString("default", { month: "long" });
        console.log(`Generating data for ${monthName}...`);
        // --- Generate Checkers Data ---
        // Varying resolution rates: 70% to 95%
        const checkersCount = 10 + Math.floor(Math.random() * 10);
        const checkersResRate = 0.7 + Math.random() * 0.25;
        for (let j = 0; j < checkersCount; j++) {
            const isResolved = Math.random() < checkersResRate;
            const createdAt = new Date(targetDate);
            createdAt.setDate(1 + Math.floor(Math.random() * 28));
            await prisma.complaint.create({
                data: {
                    title: `Historical Issue ${i}-${j}`,
                    description: "This is a historical complaint for benchmarking purposes.",
                    status: isResolved
                        ? ComplaintStatus.RESOLVED
                        : ComplaintStatus.RESPONDED,
                    userId: consumer.id,
                    brandId: checkers.id,
                    sentimentScore: 0.2 + Math.random() * 0.6,
                    createdAt,
                    updatedAt: isResolved
                        ? new Date(createdAt.getTime() + Math.random() * 48 * 3600000)
                        : createdAt,
                },
            });
        }
        // --- Generate Peer Data (Industry Base) ---
        // Fixed lower resolution rates: 50% to 75%
        for (const peer of peers) {
            const peerCount = 5 + Math.floor(Math.random() * 5);
            const peerResRate = 0.5 + Math.random() * 0.25;
            for (let j = 0; j < peerCount; j++) {
                const isResolved = Math.random() < peerResRate;
                const createdAt = new Date(targetDate);
                createdAt.setDate(1 + Math.floor(Math.random() * 28));
                await prisma.complaint.create({
                    data: {
                        title: `Peer Issue ${peer.name} ${i}-${j}`,
                        description: "Industry benchmark data point.",
                        status: isResolved
                            ? ComplaintStatus.RESOLVED
                            : ComplaintStatus.RESPONDED,
                        userId: consumer.id,
                        brandId: peer.id,
                        sentimentScore: -0.2 + Math.random() * 0.4,
                        createdAt,
                        updatedAt: isResolved
                            ? new Date(createdAt.getTime() + Math.random() * 72 * 3600000)
                            : createdAt,
                    },
                });
            }
        }
    }
    console.log("Historical data seeding complete!");
    await prisma.$disconnect();
}
seedHistoricalData().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed-historical-benchmarking.js.map