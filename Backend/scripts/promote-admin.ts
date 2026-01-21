import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "test@example.com";
  console.log(`Promoting ${email} to ADMIN...`);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });
    console.log(`Success! User ${user.email} is now an ${user.role}.`);
  } catch (error) {
    console.error("Failed to update user role:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
