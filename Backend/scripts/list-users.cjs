const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log(`Listing all users...`);

  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true },
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Failed to list users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
