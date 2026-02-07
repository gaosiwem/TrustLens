import prisma from "./src/prismaClient.js";
import bcrypt from "bcrypt";

async function createAdminUser() {
  const email = "admin@trustlens.com";
  const password = "adminpassword";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword, role: "ADMIN" },
      create: {
        email,
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
      },
    });
    console.log("Admin user created/updated:", user.email);
  } catch (err) {
    console.error("Failed to create admin user:", err);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
