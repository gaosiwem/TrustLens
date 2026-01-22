import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const email = "manager@mitmakmotors.com";
  const users = await prisma.user.findMany({
    where: { email },
    select: { id: true, email: true, role: true },
  });
  console.log(JSON.stringify(users));
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
