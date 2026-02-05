import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import crypto from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Simulating Competitor Vulnerabilities...");

  // 1. Get Brands
  const checkers = await prisma.brand.findUnique({
    where: { name: "Checkers" },
  });
  const takealot = await prisma.brand.findUnique({
    where: { name: "Takealot" },
  });

  if (!checkers || !takealot) {
    console.error("❌ Brands not found. Run seed.ts first.");
    return;
  }

  // 2. Simulate "Long Queues" for Checkers (Volume: 25)
  console.log("Creating 'Long Queues' vulnerability for Checkers...");
  for (let i = 0; i < 25; i++) {
    const text = `The queues at Checkers are insane today. Been waiting for ${20 + i} minutes.`;
    const textHash = crypto.createHash("md5").update(text).digest("hex");

    await prisma.sentimentEvent.create({
      data: {
        brandId: checkers.id,
        label: "VERY_NEGATIVE",
        score: -0.9,
        sourceType: "COMPLAINT",
        topics: ["Long Queues", "Waiting Time", "Staff Efficiency"],
        textHash,
        intensity: 0.9,
        urgency: 5,
        model: "simulated",
        provider: "openai",
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ), // Last 7 days
      },
    });
  }

  // 3. Simulate "Broken Screens" for Takealot (Volume: 15)
  console.log("Creating 'Broken Item' vulnerability for Takealot...");
  for (let i = 0; i < 15; i++) {
    const text =
      "My TV arrived with a cracked screen. Delivery guy just dropped it.";
    const textHash = crypto
      .createHash("md5")
      .update(text + i)
      .digest("hex"); // Unique hash

    await prisma.sentimentEvent.create({
      data: {
        brandId: takealot.id,
        label: "NEGATIVE",
        score: -0.7,
        sourceType: "RATING",
        topics: ["Damaged Item", "Delivery Handling", "Returns"],
        textHash,
        intensity: 0.7,
        urgency: 3,
        model: "simulated",
        provider: "openai",
        createdAt: new Date(
          Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000,
        ),
      },
    });
  }

  console.log(
    "✅ Simulation complete. Checkers and Takealot now have vulnerabilities.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
