import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "admin@trustlens.com";
  const password = process.argv[3] || "AdminPassword123!";

  console.log(`Creating admin user ${email}...`);

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`User ${email} already exists. Updating role to ADMIN...`);
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
      console.log(
        `Success! User ${updatedUser.email} is now an ${updatedUser.role}.`
      );
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "ADMIN",
        name: "Admin User",
      },
    });

    console.log(`Success! Admin user ${user.email} created.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to create admin user:", error.message);
    } else {
      console.error("Failed to create admin user:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
