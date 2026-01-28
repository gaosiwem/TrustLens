import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany({
    include: { managedBrands: true },
    take: 10,
  });

  console.log(`Found ${users.length} users:`);
  users.forEach((u) => {
    console.log(`- ${u.email} (Role: ${u.role})`);
    u.managedBrands.forEach((b) =>
      console.log(`  -> Brand: ${b.name} (${b.id})`),
    );
  });
}

listUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
