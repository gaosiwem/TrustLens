import {
  PrismaClient,
  SentimentLabel,
  SentimentSourceType,
} from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  const brandName = "Checkers";

  const brand = await prisma.brand.findFirst({
    where: { name: brandName },
  });

  if (!brand) {
    console.log(`❌ Brand "${brandName}" not found.`);
    return;
  }

  console.log(
    `🚀 Simulating Sentiment Events (Root Cause Data) for brand: ${brandName} (${brand.id})`,
  );

  const systemicIssues = [
    {
      topic: "Long Queues",
      count: 8,
      labels: [SentimentLabel.NEGATIVE, SentimentLabel.VERY_NEGATIVE],
      keyPhrases: [
        "slow service",
        "not enough tellers",
        "30 minute wait",
        "unmanned tills",
      ],
    },
    {
      topic: "Systemic Overpricing",
      count: 7,
      labels: [SentimentLabel.NEGATIVE, SentimentLabel.VERY_NEGATIVE],
      keyPhrases: [
        "pricing discrepancy",
        "shelf price differs",
        "overcharged",
        "misleading prices",
      ],
    },
    {
      topic: "Customer Support Delay",
      count: 5,
      labels: [SentimentLabel.NEGATIVE],
      keyPhrases: [
        "no response",
        "ignored my email",
        "support is useless",
        "waiting for 2 weeks",
      ],
    },
  ];

  for (const issue of systemicIssues) {
    for (let i = 0; i < issue.count; i++) {
      const label =
        issue.labels[Math.floor(Math.random() * issue.labels.length)];
      const text = `Simulated feedback about ${issue.topic} - ${issue.keyPhrases[i % issue.keyPhrases.length]}`;
      const textHash = crypto.createHash("md5").update(text).digest("hex");

      await prisma.sentimentEvent.create({
        data: {
          brandId: brand.id,
          sourceType: SentimentSourceType.COMPLAINT,
          textHash,
          language: "en",
          label,
          score: label === SentimentLabel.VERY_NEGATIVE ? 0.1 : 0.3,
          intensity: 0.8,
          urgency: 4,
          topics: [issue.topic],
          keyPhrases: [issue.keyPhrases[i % issue.keyPhrases.length]],
          model: "gpt-4o",
          provider: "openai",
          createdAt: new Date(
            Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000,
          ), // Random time in last 20 days
        },
      });
    }
    console.log(`✅ Created ${issue.count} events for topic: ${issue.topic}`);
  }

  console.log(
    "\n🎉 Sentiment Events simulation complete! Root Cause AI should now have enough data.",
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
