import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
async function createUser() {
    const args = process.argv.slice(2);
    // Parse arguments
    const email = args[0];
    const name = args[1];
    const password = args[2];
    const role = (args[3] || "USER");
    if (!email || !name || !password) {
        console.error("Usage: npx ts-node scripts/createUser.ts <email> <name> <password> [role]");
        console.error("Roles: USER, ADMIN, SUPER_ADMIN, BRAND, MODERATOR, FINANCE, AUDITOR");
        console.error("\nExamples:");
        console.error('  npx ts-node scripts/createUser.ts admin@test.com "Admin User" Password123! ADMIN');
        console.error('  npx ts-node scripts/createUser.ts user@test.com "John Doe" MyPass123');
        process.exit(1);
    }
    // Validate role
    const validRoles = [
        "USER",
        "ADMIN",
        "SUPER_ADMIN",
        "BRAND",
        "MODERATOR",
        "FINANCE",
        "AUDITOR",
    ];
    if (!validRoles.includes(role)) {
        console.error(`Invalid role: ${role}`);
        console.error(`Valid roles: ${validRoles.join(", ")}`);
        process.exit(1);
    }
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            console.error(`❌ User with email ${email} already exists!`);
            process.exit(1);
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role,
            },
        });
        console.log("✅ User created successfully!");
        console.log("\nUser Details:");
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Created: ${user.createdAt}`);
    }
    catch (error) {
        console.error("❌ Error creating user:", error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
createUser();
//# sourceMappingURL=createUser.js.map