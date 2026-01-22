"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface Notification {
  id: string;
  userId?: string | null;
  brandId?: string | null;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  read: boolean;
  priority: string;
  createdAt: string;
  metadata?: any;
}

interface UseNotificationsProps {
  userId?: string;
  brandId?: string;
  type?: "personal" | "brand" | "brand_manager" | "all";
}

export function useNotifications({
  userId,
  brandId,
  type = "personal",
}: UseNotificationsProps = {}) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const getHeaders = useCallback(() => {
    const token = (session as any)?.accessToken;
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  }, [session]);

  const fetchNotifications = useCallback(
    async (reset = false) => {
      if (!userId && !brandId) return;

      setLoading(true);
      try {
        const params: any = { type };
        if (brandId) params.brandId = brandId;
        if (!reset && cursor) params.cursor = cursor;

        const response = await axios.get(`${API_URL}/notifications`, {
          params,
          headers: getHeaders(),
        });

        // Handle both cases: response.data as array OR response.data.notifications
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.notifications || [];

        if (reset) {
          setNotifications(data);
        } else {
          setNotifications((prev) => [...prev, ...data]);
        }

        const nextCursor = response.data.nextCursor;
        setCursor(nextCursor);
        setHasMore(!!nextCursor);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [userId, brandId, type, cursor, getHeaders],
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!userId && !brandId) return;
    try {
      const params: any = { type };
      if (brandId) params.brandId = brandId;

      const response = await axios.get(
        `${API_URL}/notifications/unread-count`,
        {
          params,
          headers: getHeaders(),
        },
      );
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [userId, brandId, type, getHeaders]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await axios.patch(
          `${API_URL}/notifications/${notificationId}/read`,
          null,
          {
            headers: getHeaders(),
          },
        );
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
        );
        // Optimistic update of unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
        fetchUnreadCount();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [fetchUnreadCount, getHeaders],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const data: any = { type };
      if (brandId) data.brandId = brandId;

      await axios.patch(`${API_URL}/notifications/mark-all-read`, data, {
        headers: getHeaders(),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, [brandId, type, getHeaders]);

  const fetchMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(false);
    }
  }, [loading, hasMore, fetchNotifications]);

  const refresh = useCallback(() => {
    setCursor(null);
    fetchNotifications(true);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (userId || brandId) {
      refresh();
    }
  }, [userId, brandId, type, refresh]);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchMore,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
