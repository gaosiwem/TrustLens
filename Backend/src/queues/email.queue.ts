import { Queue } from "bullmq";
import { Redis } from "ioredis";
import logger from "../config/logger.js";

let emailQueue: Queue | null = null;
let emailQueueConnection: Redis | null = null;

function createConnection(): Redis | null {
  if (!process.env.REDIS_URL) {
    logger.warn("Email queue: REDIS_URL not set, skipping connection");
    return null;
  }
  const connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    retryStrategy: (times: number) => {
      if (times > 3) {
        logger.warn("Email queue: Redis connection failed after 3 retries");
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  connection.on("error", (err) => {
    logger.error("Email queue Redis error:", err.message);
  });

  return connection;
}

/**
 * Get the email queue instance, creating it if needed
 */
export function getEmailQueue(): Queue | null {
  if (!emailQueue) {
    try {
      emailQueueConnection = createConnection();
      if (!emailQueueConnection) {
        return null;
      }
      emailQueue = new Queue("emailQueue", {
        connection: emailQueueConnection as any,
      });
      logger.info("Email queue initialized");
    } catch (error) {
      logger.error("Failed to initialize email queue:", error);
      return null;
    }
  }
  return emailQueue;
}

// For backward compatibility - lazy initialization
export { emailQueue, emailQueueConnection };
