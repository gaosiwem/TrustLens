import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to restrict access to financial roles.
 */
export function adminFinanceOnly(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as any).user;

  if (!user || !["SUPER_ADMIN", "FINANCE", "AUDITOR"].includes(user.role)) {
    return res
      .status(403)
      .json({ error: "Access denied. Financial authorization required." });
  }

  next();
}
