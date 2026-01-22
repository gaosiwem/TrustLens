import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const brandId = "77f34479-703f-401a-acfe-7eba8039a590";
  const score = await prisma.trustScore.findFirst({
    where: { entityType: "BRAND", entityId: brandId },
    orderBy: { createdAt: "desc" },
  });
  console.log(JSON.stringify(score));
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
