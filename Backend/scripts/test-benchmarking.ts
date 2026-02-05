import { PrismaClient } from "@prisma/client";
import { BenchmarkingService } from "../src/modules/brands/benchmarking.service.js";

const prisma = new PrismaClient();

async function test() {
  const brand = await prisma.brand.findFirst();
  if (!brand) {
    console.log("No brands found");
    return;
  }

  console.log(`Testing benchmarking for brand: ${brand.name} (${brand.id})`);
  try {
    const data = await BenchmarkingService.getBenchmarkingData(brand.id);
    console.log("Benchmarking Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
