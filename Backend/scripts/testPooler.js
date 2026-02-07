import { PrismaClient } from "@prisma/client";

async function testPooler() {
  const poolerUrl =
    "postgresql://neondb_owner:npg_lysba2Ct1RMO@ep-aged-star-ahqdf6po-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";
  console.log(`Testing pooler connection...`);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: poolerUrl,
      },
    },
  });

  try {
    await prisma.$connect();
    console.log("✅ Pooler connection successful!");
    const count = await prisma.user.count();
    console.log(`User count: ${count}`);
  } catch (err) {
    console.error("❌ Pooler connection failed:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

testPooler();
