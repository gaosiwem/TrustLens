"use client";

import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useNotifications } from "../hooks/useNotifications";

interface NotificationBellProps {
  userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useSocket(userId);
  const {
    notifications,
    unreadCount: hookUnreadCount,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications({ userId });

  useEffect(() => {
    setUnreadCount(hookUnreadCount);
  }, [hookUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new notifications
    socket.on("notification", (notification: any) => {
      console.log("New notification received:", notification);
      setUnreadCount((prev) => prev + 1);
      refresh(); // Refresh notification list
    });

    return () => {
      socket.off("notification");
    };
  }, [socket, refresh]);

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Drawer */}
          <div className="fixed right-4 top-16 w-96 max-w-full bg-card border border-border rounded-xl shadow-lg z-50 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-4xl mb-2">
                    notifications_none
                  </span>
                  <p>No notifications yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`p-4 cursor-pointer hover:bg-muted transition ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`material-symbols-outlined ${
                            notification.priority === "critical"
                              ? "text-red-600"
                              : notification.priority === "warning"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        >
                          {notification.priority === "critical"
                            ? "error"
                            : notification.priority === "warning"
                              ? "warning"
                              : "info"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.body}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
