import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkPlans() {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { monthlyPrice: "asc" },
  });

  console.log("Available Subscription Plans:\n");
  plans.forEach((plan) => {
    console.log(`Code: ${plan.code}`);
    console.log(`Name: ${plan.name}`);
    console.log(`Price: R${plan.monthlyPrice}`);
    console.log(`---`);
  });
}

checkPlans()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
