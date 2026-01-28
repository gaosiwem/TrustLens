import { prisma } from "../src/lib/prisma.js";

async function main() {
  console.log("Checking Email Outbox for Follow-up Notification...");
  
  const emails = await prisma.emailOutbox.findMany({
    where: { 
        subject: { contains: "Test Message from Consumer" } 
    },
    orderBy: { createdAt: "desc" },
    take: 1
  });

  if (emails.length > 0) {
    const latest = emails[0];
    console.log("SUCCESS: Email found!");
    console.log(" - ID:", latest.id);
    console.log(" - Subject:", latest.subject);
    console.log(" - To:", latest.toEmail);
    console.log(" - CreatedAt:", latest.createdAt.toISOString());
  } else {
    console.log("FAILURE: No matching email found.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
