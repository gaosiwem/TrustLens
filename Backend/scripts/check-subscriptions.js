import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function checkBrands() {
    const brands = await prisma.brand.findMany({
        include: {
            subscriptions: {
                where: { status: "ACTIVE" },
                include: { plan: true },
            },
        },
    });
    console.log("Brands and their Active Subscriptions:");
    brands.forEach((b) => {
        console.log(`- ${b.name} (ID: ${b.id})`);
        b.subscriptions.forEach((s) => {
            console.log(`  - Plan: ${s.plan.code} (Expires: ${s.endsAt})`);
            console.log(`    Features: ${JSON.stringify(s.plan.features)}`);
        });
    });
}
checkBrands()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-subscriptions.js.map