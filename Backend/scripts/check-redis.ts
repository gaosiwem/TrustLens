import { Redis } from "ioredis";

async function main() {
  console.log("Checking Redis Connection...");
  const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
  });

  redis.on("error", (err) => {
    console.error("Redis Error:", err.message);
  });

  try {
    await redis.ping();
    console.log("Redis PING successful!");
  } catch (err) {
    console.error("Redis PING failed:", err);
  } finally {
    redis.disconnect();
  }
}

main();
