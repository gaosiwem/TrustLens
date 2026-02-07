import prisma from "./src/prismaClient.js";
import bcrypt from "bcrypt";

async function createTestUser() {
  const email = "e2e_tester@example.com";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        password: hashedPassword,
        name: "E2E Tester",
        role: "USER",
      },
    });
    console.log("Test user created/updated:", user.email);
  } catch (err) {
    console.error("Failed to create test user:", err);
  } finally {
    process.exit(0);
  }
}

createTestUser();
