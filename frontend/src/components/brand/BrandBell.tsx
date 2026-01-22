"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface BrandBellProps {
  brandId?: string;
  userId?: string;
}

export default function BrandBell({ brandId, userId }: BrandBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, refresh } =
    useNotifications({
      brandId,
      userId,
      type: brandId ? "brand" : "brand_manager",
    });

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setIsOpen(false);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-muted transition-colors flex items-center justify-center"
        aria-label="Brand Notifications"
      >
        <span className="material-symbols-outlined text-[24px]">
          notifications
        </span>
        <span
          className={`absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full border-2 border-background z-10 ${unreadCount > 0 ? "bg-red-600" : "bg-muted-foreground/40"}`}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[500px]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Brand Alerts
              </h2>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto overflow-x-hidden flex-1">
              {notifications.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-muted-foreground">
                      notifications_off
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No notifications yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 px-4">
                    We'll alert you here when something important happens.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group transition-colors relative ${
                        !notification.read
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <Link
                        href={`/brand/notifications?id=${notification.id}`}
                        onClick={() => handleNotificationClick(notification)}
                        className="flex gap-3 p-4"
                      >
                        <div
                          className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            !notification.read ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              !notification.read
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notification.type === "COMPLAINT_CREATED"
                              ? "campaign"
                              : notification.type === "STATUS_CHANGED"
                                ? "sync"
                                : notification.type === "NEW_CONSUMER_MESSAGE"
                                  ? "chat"
                                  : "notifications"}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p
                              className={`text-sm font-semibold truncate ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true },
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notification.body}
                          </p>

                          {notification.link && (
                            <Link
                              href={notification.link}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className="mt-2 text-[11px] font-bold text-primary hover:underline flex items-center gap-1 w-fit"
                            >
                              View Details
                              <span className="material-symbols-outlined text-[12px]">
                                arrow_forward
                              </span>
                            </Link>
                          )}
                        </div>

                        {!notification.read && (
                          <div className="absolute right-4 bottom-4 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted/10 text-center">
              <Link
                href="/brand/settings/notifications"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">
                  settings
                </span>
                Notification Settings
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
