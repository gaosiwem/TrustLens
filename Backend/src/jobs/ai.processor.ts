import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import prisma from "../lib/prisma.js";
import { analyzeComplaint } from "../modules/ai/ai.service.js";
import { recalcBrandScore } from "../modules/reputation/reputation.service.js";
import logger from "../config/logger.js";

let aiQueue: Queue;
let worker: Worker | null = null;

if (process.env.REDIS_URL) {
  const connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  aiQueue = new Queue("ai-jobs", { connection });

  worker = new Worker(
    "ai-jobs",
    async (job) => {
      const complaint = await prisma.complaint.findUnique({
        where: { id: job.data.id },
      });
      if (!complaint) return;

      const ai = await analyzeComplaint(complaint.description);

      await prisma.complaint.update({
        where: { id: complaint.id },
        data: {
          aiSummary: ai.summary,
          sentimentScore: ai.sentiment,
          status: "UNDER_REVIEW",
        },
      });

      // Trigger reputation recalculation after AI analysis
      if (complaint.brandId) {
        await recalcBrandScore(complaint.brandId);
      }
    },
    {
      connection: new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
      }),
    },
  );

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} failed with ${err.message}`);
  });
} else {
  logger.warn("Redus URL not set. AI Queue disabled.");
  // Mock Queue to prevent crashes on import
  aiQueue = {
    add: async () => {
      logger.warn("AI Queue: Redis missing, job skipped");
      return null;
    },
  } as unknown as Queue;
}

export { aiQueue };
