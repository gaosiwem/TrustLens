import { Redis } from "ioredis";
import logger from "./logger.js";

// Track connection state
let isConnected = false;

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  retryStrategy: (times: number) => {
    if (times > 3) {
      logger.warn(
        "Redis connection failed after 3 retries, operating in degraded mode",
      );
      return null; // Stop retrying
    }
    return Math.min(times * 200, 2000);
  },
});

redis.on("connect", () => {
  isConnected = true;
  logger.info("Redis client connected");
});

redis.on("ready", () => {
  isConnected = true;
  logger.info("Redis client ready");
});

redis.on("error", (err: Error) => {
  isConnected = false;
  logger.error("Redis client error:", err.message);
});

redis.on("close", () => {
  isConnected = false;
  logger.warn("Redis connection closed");
});

/**
 * Check if Redis is currently available
 */
export function isRedisAvailable(): boolean {
  return isConnected;
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  if (!isConnected) {
    logger.debug(`Cache get skipped for key ${key}: Redis unavailable`);
    return null;
  }
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

export async function setCachedData<T>(
  key: string,
  data: T,
  ttlSeconds: number = 300,
): Promise<void> {
  if (!isConnected) {
    logger.debug(`Cache set skipped for key ${key}: Redis unavailable`);
    return;
  }
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    logger.error(`Cache set error for key ${key}:`, error);
  }
}

export async function deleteCachedData(key: string): Promise<void> {
  if (!isConnected) {
    logger.debug(`Cache delete skipped for key ${key}: Redis unavailable`);
    return;
  }
  try {
    await redis.del(key);
  } catch (error) {
    logger.error(`Cache delete error for key ${key}:`, error);
  }
}

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
    logger.info("Redis connection established");
  } catch (error) {
    logger.warn(
      "Failed to connect to Redis - operating in degraded mode:",
      (error as Error).message,
    );
    // Don't throw - allow app to run without Redis
  }
}

export default redis;
