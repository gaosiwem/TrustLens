import { Redis } from "ioredis";
import logger from "./logger.js";

import { ENV } from "./env.js";

// Track connection state
let isConnected = false;

// If REDIS_URL is not provided, we won't even try to connect
const redisUrl = ENV.REDIS_URL;

if (!redisUrl) {
  logger.warn(
    "REDIS_URL is not defined in environment variables. Redis-dependent features will be disabled.",
  );
}

// Create Redis instance but only connect if URL is present (or default to localhost only if explicitly desired, but here we want to avoid crash)
// To avoid modifying all callsites, we still export a redis instance, but we need to handle the case where we don't want it to try connecting to localhost automatically if we are in prod.
// However, ioredis constructor *will* connect immediately or lazyConnect.
// If we pass 'null' or invalid URL it might throw.
// Strategy: use a SafeRedis wrapper or just conditional logic.
// Simplest fix based on plan: check env, if missing, don't instantiate smoothly or instantiate with lazyConnect and never connect.

const redis = new Redis(redisUrl || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true, // We will manually connect
  retryStrategy: (times: number) => {
    if (!redisUrl) return null; // Don't retry if no URL
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
  if (!ENV.REDIS_URL) {
    logger.warn("Skipping Redis connection: REDIS_URL not set");
    return;
  }
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
