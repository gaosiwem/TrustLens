import { Queue, Worker } from "bullmq";
import prisma from "../lib/prisma.js";
import { analyzeComplaint } from "../modules/ai/ai.service.js";

import { recalcBrandScore } from "../modules/reputation/reputation.service.js";

const connection = { host: "localhost", port: 6379 };

export const aiQueue = new Queue("ai-jobs", { connection });

const worker = new Worker(
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
  { connection },
);

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with ${err.message}`);
});
