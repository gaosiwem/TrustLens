import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function checkSubscription() {
  const email = "admin@trustlens.com"; // The user we are debugging
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      managedBrands: {
        include: {
          subscriptions: {
            where: { status: "ACTIVE" },
            include: { plan: true },
          },
        },
      },
    },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  console.log("User found:", user.email);
  if (user.managedBrands.length === 0) {
    console.log("No managed brands.");
    return;
  }

  for (const brand of user.managedBrands) {
    console.log(`Brand: ${brand.brandName} (${brand.id})`);
    if (brand.subscriptions.length === 0) {
      console.log("  No active subscriptions.");
    } else {
      for (const sub of brand.subscriptions) {
        console.log(`  Plan: ${sub.plan.name}`);
        console.log("  Features:", JSON.stringify(sub.plan.features, null, 2));
      }
    }
  }
}

checkSubscription()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
