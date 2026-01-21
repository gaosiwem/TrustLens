import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import logger from "../config/logger.js";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    logger.warn(
      `[Auth] No token provided for ${req.method} ${req.originalUrl}`
    );
    return res.status(401).end();
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    (req as any).user = decoded;
    logger.info(`[Auth] User authenticated: ${(decoded as any).userId}`);
    next();
  } catch (err) {
    logger.error(`[Auth] Token verification failed:`, err);
    res.status(401).end();
  }
}

export function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as any).user;
  console.log(`[AuthAdmin] User data from token:`, user);
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    console.log(
      `[AuthAdmin] Access denied for user:`,
      user?.userId || user?.id,
      "Role:",
      user?.role
    );
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
