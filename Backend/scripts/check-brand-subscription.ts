import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkBrandSubscription() {
  // Get the brand ID from the pending request
  const request = await prisma.verifiedRequest.findFirst({
    where: { status: "PENDING" },
    select: { brandId: true, brand: { select: { name: true } } },
  });

  if (!request) {
    console.log("No pending requests found");
    return;
  }

  console.log(
    `Checking subscription for brand: ${request.brand.name} (${request.brandId})`
  );

  const subscription = await prisma.brandSubscription.findUnique({
    where: { brandId: request.brandId },
    include: { plan: true },
  });

  console.log("BrandSubscription:", JSON.stringify(subscription, null, 2));
}

checkBrandSubscription()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
