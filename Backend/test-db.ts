import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting to database...");
    await prisma.$connect();
    console.log("Successfully connected to database!");
    await prisma.$disconnect();
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

main();
