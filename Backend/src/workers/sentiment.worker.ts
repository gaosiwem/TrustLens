import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { ingestSentiment } from "../services/sentimentPipeline.service.js";
import logger from "../config/logger.js";

let sentimentWorker: Worker | null = null;

function createConnection(): Redis | null {
  try {
    const connection = new Redis(
      process.env.REDIS_URL || "redis://localhost:6379",
      {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        retryStrategy: (times: number) => {
          if (times > 3) {
            logger.warn(
              "Sentiment worker: Redis connection failed after 3 retries",
            );
            return null;
          }
          return Math.min(times * 200, 2000);
        },
      },
    );

    connection.on("error", (err) => {
      logger.error("Sentiment worker Redis error:", err.message);
    });

    return connection;
  } catch (error) {
    logger.error(
      "Failed to create Redis connection for sentiment worker:",
      error,
    );
    return null;
  }
}

export function initSentimentWorker(): Worker | null {
  if (sentimentWorker) return sentimentWorker;

  const connection = createConnection();
  if (!connection) {
    logger.warn("Sentiment worker not started: Redis unavailable");
    return null;
  }

  try {
    sentimentWorker = new Worker(
      "sentimentQueue",
      async (job) => {
        const payload = job.data as any;
        logger.info(`Processing sentiment for sourceId: ${payload.sourceId}`);
        await ingestSentiment(payload);
      },
      { connection: connection as any },
    );

    sentimentWorker.on("completed", (job) => {
      logger.info(`Sentiment job ${job.id} completed`);
    });

    sentimentWorker.on("failed", (job, err) => {
      logger.error(`Sentiment job ${job?.id} failed: ${err.message}`);
    });

    logger.info("Sentiment worker initialized successfully");
    return sentimentWorker;
  } catch (error) {
    logger.error("Failed to initialize sentiment worker:", error);
    return null;
  }
}

// Export for backwards compatibility
export { sentimentWorker };
