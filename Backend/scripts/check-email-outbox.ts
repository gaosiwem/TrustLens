import { prisma } from "../src/lib/prisma.js";

async function main() {
  const count = await prisma.emailOutbox.count();
  console.log("Total emails in outbox:", count);
  const lastEmail = await prisma.emailOutbox.findFirst({
    orderBy: { createdAt: "desc" },
  });
  console.log("Last email:", lastEmail);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
