import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const deleted = await prisma.sentimentEvent.deleteMany({
        where: { sourceType: "RATING" },
    });
    console.log(`Deleted ${deleted.count} rating sentiment events.`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=cleanup-rating-sentiment.js.map