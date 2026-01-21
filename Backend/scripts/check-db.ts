import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const subs = await prisma.brandSubscription.findMany({
    include: { brand: true, plan: true },
  });
  console.log(JSON.stringify(subs, null, 2));

  const verifiedSubs = await prisma.verifiedSubscription.findMany({});
  console.log("Verified Subscriptions:", JSON.stringify(verifiedSubs, null, 2));

  const verifiedRequests = await prisma.verifiedRequest.findMany({});
  console.log("Verified Requests:", JSON.stringify(verifiedRequests, null, 2));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
