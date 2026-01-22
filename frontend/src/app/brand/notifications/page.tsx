"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  useNotifications,
  Notification,
} from "../../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import BrandHeader from "../../../components/brand/BrandHeader";

export default function NotificationCenter() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  const [selectedId, setSelectedId] = useState<string | null>(initialId);

  const {
    notifications,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
    unreadCount,
  } = useNotifications({
    userId: session?.user?.id,
    type: "brand_manager",
  });

  const selectedNotification = useMemo(() => {
    return notifications.find((n) => n.id === selectedId) || null;
  }, [notifications, selectedId]);

  useEffect(() => {
    if (initialId) {
      setSelectedId(initialId);
    }
  }, [initialId]);

  useEffect(() => {
    if (selectedNotification && !selectedNotification.read) {
      markAsRead(selectedNotification.id);
    }
  }, [selectedNotification, markAsRead]);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <BrandHeader
        title="Notification Center"
        subtitle="Manage and respond to your brand alerts"
      />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex overflow-hidden">
          {/* Left Pane: Notification List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-card">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <button
                onClick={() => markAllAsRead()}
                className="text-xs font-semibold text-primary hover:underline transition-all"
              >
                Mark all read
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/60">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground italic">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-muted-foreground/30">
                    notifications_off
                  </span>
                  <p className="text-sm text-muted-foreground">
                    No notifications found.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => setSelectedId(notif.id)}
                    className={`w-full text-left p-4 transition-all relative hover:bg-muted/50 ${
                      selectedId === notif.id
                        ? "bg-primary/5 ring-1 ring-inset ring-primary/20"
                        : ""
                    } ${!notif.read ? "border-l-4 border-primary" : "border-l-4 border-transparent"}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-xs font-bold uppercase tracking-tight ${
                          !notif.read
                            ? "text-primary"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {notif.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p
                      className={`text-sm font-semibold truncate ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {notif.body}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Pane: Detail View */}
          <div className="hidden md:flex flex-1 flex-col bg-background relative overflow-y-auto">
            {selectedNotification ? (
              <div className="p-8 lg:p-12 max-w-3xl border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      selectedNotification.priority === "critical" ||
                      selectedNotification.priority === "high"
                        ? "bg-primary/20 text-primary"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {selectedNotification.type === "COMPLAINT_CREATED"
                        ? "campaign"
                        : selectedNotification.type === "STATUS_CHANGED"
                          ? "sync"
                          : selectedNotification.type === "NEW_CONSUMER_MESSAGE"
                            ? "chat"
                            : "notifications"}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      {selectedNotification.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Received{" "}
                      {new Date(
                        selectedNotification.createdAt,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed mb-8">
                  <p className="text-lg text-foreground/80">
                    {selectedNotification.body}
                  </p>
                </div>

                {selectedNotification.link && (
                  <div className="mt-8 pt-8 border-t border-border">
                    <Link
                      href={selectedNotification.link}
                      className="inline-flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/30 active:scale-95 group text-base"
                    >
                      {selectedNotification.type.includes("COMPLAINT")
                        ? "Open Full Complaint"
                        : "View Target Details"}
                      <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 text-xl">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                )}

                {selectedNotification.metadata &&
                  Object.keys(selectedNotification.metadata).length > 0 && (
                    <div className="mt-12 pt-8 border-t border-border">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                        Technical Metadata
                      </h3>
                      <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                        <pre className="text-xs font-mono overflow-auto text-muted-foreground">
                          {JSON.stringify(
                            selectedNotification.metadata,
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-muted-foreground flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-5xl">
                    mark_as_unread
                  </span>
                </div>
                <h2 className="text-xl font-bold">Select a notification</h2>
                <p className="text-muted-foreground mt-2">
                  Choose an alert from the column on the left to read its full
                  details here.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
