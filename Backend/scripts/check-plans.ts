import { prisma } from "../src/lib/prisma.js";

async function main() {
  const plans = await prisma.subscriptionPlan.findMany();
  console.log("Subscription Plans:", JSON.stringify(plans, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
