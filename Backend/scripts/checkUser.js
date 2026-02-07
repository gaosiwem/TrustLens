import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function checkUser() {
  const email = "admin@trustlens.com";
  console.log(`Checking user: ${email}`);

  try {
    await prisma.$connect();
    console.log("✅ Database connection successful");

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ User not found!");
      const allUsers = await prisma.user.findMany({
        select: { email: true },
        take: 5,
      });
      console.log(
        "Existing users (up to 5/User):",
        allUsers.map((u) => u.email).join(", "),
      );
    } else {
      console.log("✅ User found!");
      console.log(`ID: ${user.id}`);
      console.log(`Role: ${user.role}`);
      console.log(`Has password: ${!!user.password}`);
      if (user.password) {
        console.log(
          `Password starts with: ${user.password.substring(0, 10)}...`,
        );
        const passwordsToTest = ["administrator123!", "administrator123"];
        for (const testPass of passwordsToTest) {
          const isValid = await bcrypt.compare(testPass, user.password);
          console.log(
            `Manual check for '${testPass}': ${isValid ? "MATCH ✅" : "NO MATCH ❌"}`,
          );
        }
      }
    }
  } catch (err) {
    console.error("❌ Database error details:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
