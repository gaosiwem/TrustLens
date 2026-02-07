import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const staleUserId = "ec2375e8-92a6-4000-8732-80463c71cd82";
    const brandId = "77f34479-703f-401a-acfe-7eba8039a590";
    const email = "manager@mitmakmotors.com";
    // 1. Delete user with this email if exists but has different ID
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== staleUserId) {
        console.log("Deleting existing user with same email but different ID:", existingUser.id);
        await prisma.user.delete({ where: { id: existingUser.id } });
    }
    // 2. Create user with the stale ID
    const user = await prisma.user.upsert({
        where: { id: staleUserId },
        update: { role: "BRAND", email: email },
        create: {
            id: staleUserId,
            email: email,
            name: "Mit Mak Motors Manager",
            password: "MOCKED_PASSWORD",
            role: "BRAND",
        },
    });
    console.log("User synced:", JSON.stringify(user));
    // 3. Assign brand
    const brand = await prisma.brand.update({
        where: { id: brandId },
        data: { managerId: staleUserId },
    });
    console.log("Brand assigned:", JSON.stringify(brand));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=fix_session_user_v2.js.map