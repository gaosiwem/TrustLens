import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkBrand() {
  console.log("Checking for brand 'Checkers'...");

  // Case insensitive search to find what's there
  const brands = await prisma.brand.findMany({
    where: {
      name: {
        contains: "Checkers",
        mode: "insensitive",
      },
    },
    select: { id: true, name: true, slug: true },
  });

  console.log("Found brands:", brands);

  const exactSlug = await prisma.brand.findUnique({
    where: { slug: "checkers" },
  });
  console.log(
    "Exact slug 'checkers' match:",
    exactSlug ? "Found" : "Not Found",
  );
}

checkBrand()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
