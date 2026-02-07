import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

console.log(`[Test] Connecting to Redis at ${redisUrl}...`);

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  connectTimeout: 5000,
});

redis.on("connect", () => {
  console.log("[Test] ✅ Connected to Redis successfully!");
  redis.ping().then((res) => {
    console.log(`[Test] PING response: ${res}`);
    redis.quit();
    process.exit(0);
  });
});

redis.on("error", (err) => {
  console.error(`[Test] ❌ Connection failed: ${err.message}`);
  redis.quit();
  process.exit(1);
});
