import { prisma } from "../src/lib/prisma.js";
import { notifyBrand } from "../src/modules/notifications/notification.service.js";

async function main() {
  console.log("Verifying Follow-up Notification...");

  // 1. Get a random Brand with Active Verified Subscription
  const subscription = await prisma.brandSubscription.findFirst({
    where: { status: "ACTIVE", plan: { code: "BASIC_VERIFIED" } },
    include: { brand: { include: { manager: true } } },
  });

  if (!subscription) {
    console.error("No active verified subscription found for testing.");
    return;
  }

  const brand = subscription.brand;
  console.log(`Using Brand: ${brand.name} (${brand.id})`);
  console.log(`Manager Email: ${brand.manager?.email}`);

  // 2. Simulate Consumer Message Notification
  // We call notifyBrand directly to test the service logic (which includes the subscription check)
  // This is what followup.service.ts calls.
  try {
    await notifyBrand({
      brandId: brand.id,
      type: "NEW_CONSUMER_MESSAGE",
      title: "Test Message from Consumer",
      body: "This is a test message to verify email alerts for verified brands.",
      link: `/brand/complaints/test-id`,
    });
    console.log("Notification logic executed.");
  } catch (err) {
    console.error("Error executing notifyBrand:", err);
  }

  // 3. Check Email Outbox
  console.log("Checking Email Outbox...");
  const emails = await prisma.emailOutbox.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  if (emails.length > 0) {
    const latest = emails[0];
    console.log("Latest Email:");
    console.log(" - Subject:", latest.subject);
    console.log(" - To:", latest.toEmail);
    console.log(" - CreatedAt:", latest.createdAt.toISOString());
    console.log(
      " - Verification Passed:",
      latest.subject.includes("Test Message"),
    );
  } else {
    console.log("No emails found.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
