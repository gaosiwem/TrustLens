"use client";
import { useState, useEffect } from "react";
import NotificationCard from "../../components/NotificationCard";
import { Button } from "../../components/ui/button";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for Sprint 10
    const mockNotifications = [
      {
        id: "1",
        type: "complaint",
        message:
          "Your complaint about Brand A has been received and is under review.",
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        type: "resolution",
        message: "Your complaint has been resolved. Please provide feedback.",
        read: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "3",
        type: "feedback",
        message: "Thank you for your feedback! It helps us improve.",
        read: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "4",
        type: "system",
        message: "New AI-powered features are now available in your dashboard.",
        read: true,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  const handleMarkRead = (id: string) => {
    // In production, call API: await axios.patch(`/api/notifications/${id}/read`)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    // In production, call API: await axios.patch('/api/notifications/mark-all-read')
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${
                  unreadCount !== 1 ? "s" : ""
                }`
              : "You're all caught up!"}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4 block">
              notifications_off
            </span>
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))
        )}
      </div>
    </div>
  );
}
