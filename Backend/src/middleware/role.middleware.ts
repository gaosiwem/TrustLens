import type { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role !== role && req.user.role !== "ADMIN")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
