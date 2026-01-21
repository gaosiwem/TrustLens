import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const ratingCount = await prisma.rating.count();
  const complaintCount = await prisma.complaint.count();
  const brandCount = await prisma.brand.count();
  const ratings = await prisma.rating.findMany({
    take: 5,
    include: {
      user: true,
      complaint: {
        include: {
          brand: true,
        },
      },
    },
  });

  console.log("--- DATABASE DIAGNOSTIC ---");
  console.log(`Total Ratings: ${ratingCount}`);
  console.log(`Total Complaints: ${complaintCount}`);
  console.log(`Total Brands: ${brandCount}`);
  ratings.forEach((r, i) => {
    console.log(`Rating ${i + 1}:`);
    console.log(`  Stars: ${r.stars}`);
    console.log(`  User: ${r.user?.name || r.user?.email}`);
    console.log(`  Brand: ${r.complaint?.brand?.name || "Missing"}`);
    console.log(`  Comment: ${r.comment}`);
  });
  console.log("--- END DIAGNOSTIC ---");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
