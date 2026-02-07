import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@checkers.com";
  console.log(`Inspecting state for user: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      managedBrands: {
        include: {
          subscriptions: {
            include: { plan: true },
          },
          verificationRequests: {
            include: { verifiedSubscription: true },
          },
        },
      },
    },
  });

  if (!user) {
    console.log("User not found!");
    return;
  }

  console.log("User ID:", user.id);
  console.log("Role:", user.role);

  const managedBrands = (user as any).managedBrands;

  if (!managedBrands || managedBrands.length === 0) {
    console.log("No managed brand found for this user.");
    return;
  }

  const brand = managedBrands[0];

  console.log("--- Brand State ---");
  console.log("ID:", brand.id);
  console.log("Name:", brand.name);
  console.log("Is Verified (public flag):", brand.isVerified);

  console.log("\n--- Subscription State ---");
  if (brand.subscriptions && brand.subscriptions.length > 0) {
    const sub = brand.subscriptions[0];
    console.log("Status:", sub.status);
    console.log("Plan:", sub.plan.code);
    console.log("Started At:", sub.startedAt);
    console.log("Ends At:", sub.endsAt);
  } else {
    console.log("No active subscription.");
  }

  console.log("\n--- Verified Requests ---");
  if (brand.verificationRequests.length > 0) {
    brand.verificationRequests.forEach((req, i) => {
      console.log(`Request #${i + 1}:`);
      console.log("  ID:", req.id);
      console.log("  Status:", req.status);
      console.log("  Updated At:", req.updatedAt);
      console.log("  Documents:", JSON.stringify(req.documents));
    });
  } else {
    console.log("No verified requests found.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
