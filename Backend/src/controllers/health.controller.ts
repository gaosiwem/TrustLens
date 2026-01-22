import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import redis, { isRedisAvailable } from "../config/redis.js";
import logger from "../config/logger.js";

export async function healthCheck(req: Request, res: Response) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis connection status
    let redisStatus = "disconnected";
    if (isRedisAvailable()) {
      try {
        await redis.ping();
        redisStatus = "connected";
      } catch {
        redisStatus = "error";
      }
    }

    const health = {
      status: redisStatus === "connected" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: "connected",
        redis: redisStatus,
      },
    };

    logger.info("Health check passed", { redisStatus });
    res.json(health);
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Service unavailable",
    });
  }
}
