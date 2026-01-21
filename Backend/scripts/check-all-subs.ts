import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkAllSubscriptionData() {
  const request = await prisma.verifiedRequest.findFirst({
    where: { status: "PENDING" },
    include: {
      brand: { select: { name: true, id: true } },
      verifiedSubscription: true,
    },
  });

  if (!request) {
    console.log("No pending requests");
    return;
  }

  console.log(`Brand: ${request.brand.name}`);
  console.log(`Brand ID: ${request.brand.id}`);
  console.log("\nVerifiedSubscription records:");
  console.log(JSON.stringify(request.verifiedSubscription, null, 2));

  const brandSub = await prisma.brandSubscription.findUnique({
    where: { brandId: request.brand.id },
    include: { plan: true },
  });

  console.log("\nBrandSubscription:");
  console.log(JSON.stringify(brandSub, null, 2));
}

checkAllSubscriptionData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
