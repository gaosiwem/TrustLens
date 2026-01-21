"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  priority: string;
  createdAt: string;
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(
    async (reset = false) => {
      if (!userId) return;

      setLoading(true);
      try {
        const params = reset ? {} : cursor ? { cursor } : {};
        const response = await axios.get("/api/notifications", { params });

        const newNotifications = response.data.notifications || [];

        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }

        setCursor(response.data.nextCursor);
        setHasMore(!!response.data.nextCursor);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [userId, cursor]
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch("/api/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  const fetchMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(false);
    }
  }, [loading, hasMore, fetchNotifications]);

  const refresh = useCallback(() => {
    setCursor(null);
    fetchNotifications(true);
  }, [fetchNotifications]);

  useEffect(() => {
    if (userId) {
      fetchNotifications(true);
    }
  }, [userId]);

  return {
    notifications,
    loading,
    hasMore,
    fetchMore,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
