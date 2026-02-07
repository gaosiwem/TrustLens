import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const userId = "ec2375e8-92a6-4000-8732-80463c71cd82";
    const brands = await prisma.brand.findMany({
        where: { managerId: userId },
        select: { id: true, name: true },
    });
    console.log(JSON.stringify(brands));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check_user_brands.js.map