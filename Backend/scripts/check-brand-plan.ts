import prisma from "./src/lib/prisma.js";

async function main() {
  const brandId = "f385a184-11f0-4636-9845-cc8fdb538cd4";
  console.log("Checking brand:", brandId);

  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { id: true, name: true, widgetPlan: true, widgetWatermark: true },
  });
  console.log("Current Plan:", brand?.widgetPlan);

  console.log("Updating to BUSINESS...");
  const updated = await prisma.brand.update({
    where: { id: brandId },
    data: { widgetPlan: "BUSINESS" },
  });
  console.log("Updated Plan:", updated.widgetPlan);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
