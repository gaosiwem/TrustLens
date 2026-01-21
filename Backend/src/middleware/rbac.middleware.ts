import type { Request, Response, NextFunction } from "express";

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Forbidden - Insufficient permissions" });
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userRole = req.user?.role;

  if (!userRole) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userRole = req.user?.role;

  if (!userRole) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Super admin access required" });
  }

  next();
}
