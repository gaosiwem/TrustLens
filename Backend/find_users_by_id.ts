import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const id1 = "eed7978b-48c0-4629-a52f-b9b191de0513";
  const id2 = "ec2375e8-92a6-4000-8732-80463c71cd82";
  const users = await prisma.user.findMany({
    where: { id: { in: [id1, id2] } },
    select: { id: true, email: true, role: true },
  });
  console.log(JSON.stringify(users));
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
