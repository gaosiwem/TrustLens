import type { Request, Response } from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "./notification.service.js";

export async function getNotificationsController(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { cursor } = req.query;
    const notifications = await getNotifications(
      userId,
      cursor as string | undefined
    );

    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function markNotificationReadController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Notification ID required" });
    }

    const notification = await markNotificationRead(id);
    res.json(notification);
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function markAllNotificationsReadController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await markAllNotificationsRead(userId);
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

    const count = await getUnreadCount(userId);
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
      pushEnabled
    );
    res.json(preferences);
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
