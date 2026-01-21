import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkVerificationRequests() {
  const pendingRequests = await prisma.verifiedRequest.findMany({
    where: { status: "PENDING" },
    include: {
      brand: {
        select: {
          name: true,
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      },
      user: { select: { email: true } },
    },
  });

  console.log(
    "Pending Verification Requests:",
    JSON.stringify(pendingRequests, null, 2)
  );
  console.log(`\nTotal pending requests: ${pendingRequests.length}`);
}

checkVerificationRequests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
