import { Queue } from "bullmq";
import { Redis } from "ioredis";
import logger from "../config/logger.js";

let sentimentQueue: Queue | null = null;
let sentimentQueueConnection: Redis | null = null;

function createConnection(): Redis {
  const connection = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        if (times > 3) {
          logger.warn(
            "Sentiment queue: Redis connection failed after 3 retries",
          );
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    },
  );

  connection.on("error", (err) => {
    logger.error("Sentiment queue Redis error:", err.message);
  });

  return connection;
}

/**
 * Get the sentiment queue instance, creating it if needed
 */
export function getSentimentQueue(): Queue | null {
  if (!sentimentQueue) {
    try {
      sentimentQueueConnection = createConnection();
      sentimentQueue = new Queue("sentimentQueue", {
        connection: sentimentQueueConnection as any,
      });
      logger.info("Sentiment queue initialized");
    } catch (error) {
      logger.error("Failed to initialize sentiment queue:", error);
      return null;
    }
  }
  return sentimentQueue;
}

// For backward compatibility - lazy initialization
export { sentimentQueue, sentimentQueueConnection };
