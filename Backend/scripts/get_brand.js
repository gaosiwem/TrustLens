import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const brand = await prisma.brand.findFirst({
        select: { id: true, name: true },
    });
    console.log(JSON.stringify(brand));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=get_brand.js.map