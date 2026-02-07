import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const brand = await prisma.brand.findFirst({
        where: { managerId: { not: null } },
        select: { id: true, name: true, managerId: true },
    });
    if (brand) {
        const user = await prisma.user.findUnique({
            where: { id: brand.managerId },
            select: { email: true },
        });
        console.log(JSON.stringify({ brand, user }));
    }
    else {
        console.log("No brand with manager found");
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=get_manager.js.map