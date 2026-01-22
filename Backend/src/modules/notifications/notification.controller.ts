import type { Request, Response } from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "./notification.service.js";
import { prisma } from "../../lib/prisma.js";

/**
 * Checks if a user has access to a brand's data.
 */
async function checkBrandAccess(
  userId: string,
  brandId: string,
): Promise<boolean> {
  // Check if user is a member of the brand
  const membership = await prisma.brandMember.findFirst({
    where: {
      userId,
      brandId,
      isActive: true,
    },
  });

  if (membership) return true;

  // OR if user is a BRAND manager (legacy support)
  const brand = await prisma.brand.findFirst({
    where: {
      id: brandId,
      managerId: userId,
    },
  });

  return !!brand;
}

export async function getNotificationsController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { cursor, brandId, type } = req.query;

    let targetUserId: string | undefined = userId;
    let targetBrandId: string | undefined = undefined;
    let targetBrandIds: string[] | undefined = undefined;

    if (type === "brand" && brandId) {
      const hasAccess = await checkBrandAccess(userId, brandId as string);
      if (!hasAccess) {
        return res
          .status(403)
          .json({ error: "Forbidden: No access to this brand" });
      }
      targetBrandId = brandId as string;
      targetUserId = undefined;
    } else if (type === "brand_manager") {
      // Aggregated view: get all brands user manages
      const managedBrands = await prisma.brand.findMany({
        where: {
          OR: [
            { managerId: userId },
            { members: { some: { userId, isActive: true } } },
          ],
        },
        select: { id: true },
      });
      targetBrandIds = managedBrands.map((b) => b.id);
      // We want BOTH user notifications AND brand notifications for these brands
      // Since getNotifications service currently takes singular brandId, we'll need to update it or handle here.
      // Let's pass the array if the service can handle it, or use personal for now.
    }

    // Update: If we have multiple brands, we'll need a different service call or update the current one.
    // For now, let's query directly or update getNotifications to handle multiple brand IDs.
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId },
          targetBrandId ? { brandId: targetBrandId } : {},
          targetBrandIds && targetBrandIds.length > 0
            ? { brandId: { in: targetBrandIds } }
            : {},
        ].filter((q) => Object.keys(q).length > 0) as any,
      },
      take: 20,
      skip: cursor ? 1 : 0,
      ...(cursor && { cursor: { id: cursor as string } }),
      orderBy: { createdAt: "desc" },
    });

    // Simple cursor handling for now
    const nextCursor =
      notifications.length === 20 && notifications[19]?.id
        ? notifications[19].id
        : null;

    res.json({ notifications, nextCursor });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function markNotificationReadController(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id) {
      return res.status(400).json({ error: "Notification ID required" });
    }

    // Security check: ensure the notification belongs to this user or their brand
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.userId && notification.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (notification.brandId) {
      const hasAccess = await checkBrandAccess(userId!, notification.brandId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    const updated = await markNotificationRead(id);
    res.json(updated);
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function markAllNotificationsReadController(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { brandId, type } = req.body;

    if (brandId) {
      const hasAccess = await checkBrandAccess(userId, brandId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden" });
      }
      await markAllNotificationsRead({ brandId });
    } else if (type === "brand_manager") {
      const managedBrands = await prisma.brand.findMany({
        where: {
          OR: [
            { managerId: userId },
            { members: { some: { userId, isActive: true } } },
          ],
        },
        select: { id: true },
      });
      const brandIds = managedBrands.map((b) => b.id);

      await prisma.notification.updateMany({
        where: {
          OR: [{ userId }, { brandId: { in: brandIds } }],
          read: false,
        },
        data: { read: true, readAt: new Date() },
      });
    } else {
      await markAllNotificationsRead({ userId });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUnreadCountController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { brandId, type } = req.query;

    let count;
    if (brandId) {
      const hasAccess = await checkBrandAccess(userId, brandId as string);
      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden" });
      }
      count = await getUnreadCount({ brandId: brandId as string });
    } else if (type === "brand_manager") {
      const managedBrands = await prisma.brand.findMany({
        where: {
          OR: [
            { managerId: userId },
            { members: { some: { userId, isActive: true } } },
          ],
        },
        select: { id: true },
      });
      const brandIds = managedBrands.map((b) => b.id);

      count = await prisma.notification.count({
        where: {
          OR: [{ userId }, { brandId: { in: brandIds } }],
          read: false,
        },
      });
    } else {
      count = await getUnreadCount({ userId });
    }

    res.json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPreferencesController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const preferences = await getNotificationPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updatePreferencesController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { emailEnabled, pushEnabled } = req.body;

    if (typeof emailEnabled !== "boolean" || typeof pushEnabled !== "boolean") {
      return res.status(400).json({ error: "Invalid preferences format" });
    }

    const preferences = await updateNotificationPreferences(
      userId,
      emailEnabled,
      pushEnabled,
    );
    res.json(preferences);
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
