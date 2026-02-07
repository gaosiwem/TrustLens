import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const staleUserId = "ec2375e8-92a6-4000-8732-80463c71cd82";
    const brandId = "77f34479-703f-401a-acfe-7eba8039a590";
    const email = "manager@mitmakmotors.com";
    // Create or update user
    const user = await prisma.user.upsert({
        where: { id: staleUserId },
        update: { role: "BRAND" },
        create: {
            id: staleUserId,
            email: email,
            name: "Mit Mak Motors Manager",
            password: "MOCKED_PASSWORD",
            role: "BRAND",
        },
    });
    console.log("User synced:", JSON.stringify(user));
    // Assign brand
    const brand = await prisma.brand.update({
        where: { id: brandId },
        data: { managerId: staleUserId },
    });
    console.log("Brand assigned:", JSON.stringify(brand));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=fix_session_user.js.map