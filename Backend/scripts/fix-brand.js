import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function fixBrand() {
    console.log("Fixing brand 'Checkers'...");
    const brand = await prisma.brand.findFirst({
        where: { name: "Checkers" },
    });
    if (brand) {
        await prisma.brand.update({
            where: { id: brand.id },
            data: { slug: "checkers" },
        });
        console.log("Updated 'Checkers' with slug 'checkers'.");
    }
    else {
        console.log("Brand not found.");
    }
}
fixBrand()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=fix-brand.js.map